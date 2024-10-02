// Resources
import { WebSocket } from "ws";
import axios from "axios";

export class pteroWebSocket {
  // Constructor parameters
  private panelUrl: string;
  private clientKey: string;
  private serverId: string;
  // Internal variables
  private socketUrl: string;
  private socketToken: string;
  private socket: WebSocket;

  constructor(panelUrl: string, clientKey: string, serverId: string) {
    this.panelUrl = panelUrl;
    this.clientKey = clientKey;
    this.serverId = serverId;

    try {
      (async () => {
        await this.authCon(true);

        this.socket.on("auth success", () => {
          console.log("Successfully authenticated connection to websocket.");
        });

        this.socket.on("token expiring", async () => {
          await this.authCon(false);
        });
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
  public on(event: string, func: (args: any) => void): void {
    if (!this.socket)
      throw new Error("Websocket connection has not yet been established.");

    this.socket.on(event, (args) => func(args));
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
