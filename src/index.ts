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

  constructor(panelUrl: string, clientKey: string, serverId: string) {
    this.panelUrl = panelUrl;
    this.clientKey = clientKey;
    this.serverId = serverId;

    try {
      (async () => {
        const socketReq = await axios.get(
          `${this.panelUrl}/api/client/servers/${this.serverId}/websocket`,
          {
            headers: {
              Authorization: `Bearer: ${this.clientKey}`,
            },
          }
        );

        this.socketUrl = socketReq.data.data.socketUrl;
        this.socketToken = socketReq.data.data.token;
      })();
    } catch (e) {
      throw e;
    }
  }

  public on(event: string, func: (args: []) => void) {
    // TODO: Once websocket connection is actually made, integrate it with the "on" event.
    const testEvent = "msg";

    if (testEvent === event) {
      func([]);
    }
  }
}
