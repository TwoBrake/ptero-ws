// Resources
import { RawData, WebSocket } from "ws";
import axios from "axios";

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

export class pteroWebSocket {
  // Constructor parameters
  private panelUrl: string;
  private clientKey: string;
  private serverId: string;
  // Internal variables
  private socketUrl: string;
  private socketToken: string;
  private socket: WebSocket;
  private eventListeners: { [key: string]: ((args: any) => void)[] } = {};

  constructor(panelUrl: string, clientKey: string, serverId: string) {
    this.panelUrl = panelUrl;
    this.clientKey = clientKey;
    this.serverId = serverId;

    try {
      (async () => {
        await this.authCon(true);

        this.regInternalEvent("auth success", () => {
          console.log("Successfully authenticated websocket connection.");
        });

        this.regInternalEvent("token expiring", async () => {
          await this.authCon(false);
        });

        this.socket.on("message", (data) => this.handleMessage(data));
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
  public on(event: ServerReceivableEvent, func: (args: any) => void): void {
    if (!this.socket)
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
  public send(event: ServerSendableEvent, args: any) {}

  /**
   * Handles incoming websocket messages and triggers the appropriate event listeners.
   * @param data - The incoming message data.
   */
  private handleMessage(data: RawData): void {
    const message = JSON.parse(data.toString());
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
    this.eventListeners[event] = [];
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
      this.socketUrl = socketReq.data.data.socket;

      this.socket = new WebSocket(this.socketUrl, {
        headers: {
          authorization: this.socketToken,
        },
        origin: this.panelUrl,
      });

      this.socket.on("open", () => {
        console.log("Connected to websocket.");
        this.socket.send(
          JSON.stringify({ event: "auth", args: [this.socketToken] }) // Send packet to websocket to authenticate with websocket token.
        );
      });
    } else {
      this.socket.send(
        JSON.stringify({ event: "auth", args: [this.socketToken] }) // Revalidate socket token.
      );
    }
  }
}
