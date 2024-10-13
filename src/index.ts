// Resources
import { WebSocket as NodeWebSocket, RawData } from "ws";
import EventEmitter from "events";
import axios from "axios";

// Interfaces
interface SocketOptions {
  debug: boolean;
  browser?: boolean;
}

// Types
type ServerReceivableEvent =
  | "auth success"
  | "backup complete"
  | "back restore completed"
  | "console output"
  | "daemon error"
  | "daemon message"
  | "install completed"
  | "install output"
  | "install started"
  | "jwt error"
  | "stats"
  | "status"
  | "token expired"
  | "token expiring"
  | "transfer logs"
  | "transfer status";

type ServerSendableEvent =
  | "auth"
  | "set state"
  | "send command"
  | "send logs"
  | "send stats";

export class pterows extends EventEmitter {
  // Constructor parameters
  private panelUrl: string;
  private clientKey: string;
  private serverId: string;
  private options: SocketOptions = { debug: false, browser: false };
  // Internal variables
  private socketUrl: string;
  private socketToken: string;
  private socket: WebSocket | NodeWebSocket;
  private eventListeners: { [key: string]: ((args: any) => void)[] } = {};

  constructor(
    panelUrl: string,
    clientKey: string,
    serverId: string,
    options?: SocketOptions
  ) {
    super();
    this.panelUrl = panelUrl;
    this.clientKey = clientKey;
    this.serverId = serverId;
    options ? (this.options = options) : "";

    try {
      (async () => {
        await this.authCon(true);

        this.regInternalEvent("auth success", () => {
          this.debug("Successfully authenticated websocket connection.");
        });

        this.regInternalEvent("token expiring", async () => {
          await this.authCon(false);
        });

        if (this.options.browser) {
          const socket: WebSocket = this.socket as WebSocket;

          socket.onmessage = (event) => this.handleMessage(event.data);
          socket.onopen = () => this.emit("open");
          socket.onclose = () => this.emit("close");
          socket.onerror = (error) => this.emit("error", error);
        } else {
          const socket: NodeWebSocket = this.socket as NodeWebSocket;

          socket.on("message", (data) => this.handleMessage(data));
        }
      })();
    } catch (e) {
      throw e;
    }
  }

  /**
   * Listens to a specific event.
   * @param event - The event to listen to.
   * @param func - The function to run when the event is triggered.
   */
  public listen(event: ServerReceivableEvent, func: (args: any) => void): void {
    if (!this.socketOpen())
      throw new Error("Websocket connection has not yet been established.");

    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(func);
  }

  /**
   * Sends an event to the server.
   * @param event - The event to send.
   * @param args - The arguments to send with the event.
   */
  public send(event: ServerSendableEvent, args: any): void {
    if (!this.socketOpen())
      throw new Error("Websocket connection has not yet been established.");

    this.socket.send(JSON.stringify({ event: event, args: args }));
  }

  /**
   * Closes websocket connection.
   */
  public close(): void {
    if (this.socketOpen()) {
      this.socket.close();
      this.socket = undefined; // Once socket is closed, clear variable that stores websocket.
      this.debug("Socket has been successfully closed.");
      this.emit("close");
    } else {
      throw new Error("Websocket connection has not yet been established.");
    }
  }

  /**
   * Handles incoming websocket messages and triggers the appropriate event listeners.
   * @param data - The incoming message data.
   */
  private handleMessage(data: string | RawData): void {
    const message = JSON.parse(String(data));
    const event = message.event;
    const args = message.args;

    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => listener(args));
    }
  }

  /**
   * Registers an internal event.
   * @param event - The event name.
   * @param func - The function to run when the event is triggered.
   */
  private regInternalEvent(event: ServerReceivableEvent, func: () => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(func);
  }

  /**
   * Connects and authenticates or reauthenticate on token expiring the websocket connection.
   * @param initial - Whether or not this is the initial connection to the websocket.
   */
  private async authCon(initial: boolean): Promise<void> {
    const socketReq = await axios.get(
      `${this.panelUrl}/api/client/servers/${this.serverId}/websocket`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.clientKey}`,
        },
      }
    );

    this.socketToken = socketReq.data.data.token;

    if (initial) {
      if (this.options.browser) {
        // * NATIVE WEBSOCKET METHOD
        try {
          this.socketUrl = `${socketReq.data.data.socket}?token=${this.socketToken}`;
          this.socket = new WebSocket(this.socketUrl);

          this.socket.onopen = () => {
            this.debug("Connected to websocket.");
            this.socket.send(
              JSON.stringify({ event: "auth", args: [this.socketToken] }) // Send packet to websocket to authenticate with websocket token.
            );
            this.emit("open");
          };
        } catch (e) {
          this.debug(e);
          throw new Error(
            "Browser environment does not exist. Try using a browser environment or turn of browser in options."
          );
        }
      } else {
        // * NODEJS WEBSOCKET METHOD
        this.socketUrl = socketReq.data.data.socket;
        this.socket = new NodeWebSocket(this.socketUrl, {
          headers: {
            authorization: this.socketToken,
          },
          origin: this.panelUrl,
        });

        this.socket.on("open", () => {
          this.debug("Connected to websocket.");
          this.socket.send(
            JSON.stringify({ event: "auth", args: [this.socketToken] }) // Send packet to websocket to authenticate with websocket token.
          );
          this.emit("open");
        });
      }
    } else {
      this.socket.send(
        JSON.stringify({ event: "auth", args: [this.socketToken] }) // Revalidate socket token.
      );
    }
  }

  /**
   * Determines if the socket has been initialized and is ready for use.
   * @returns - Whether or not the socket is open.
   */
  private socketOpen(): boolean {
    if (this.socket && this.socket.OPEN) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Internal debugging method.
   * @param msg - The message to log to the console.
   */
  private debug(msg: string): void {
    if (this.options.debug) {
      console.log(msg);
    }
  }
}
