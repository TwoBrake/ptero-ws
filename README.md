# Ptero WS

Ptero WS is a Node.js wrapper for handling websocket connections to a Pterodactyl Panel instance.

## Features

- **✨ Easy to use**: Ptero WS is designed to be easy to use and understand.
- **🛠️ Typescript support**: Ptero WS is written in Typescript, so you can use it in your Typescript projects.
- **📜 Fully typed**: Ptero WS is fully typed, so you can use it in your Typescript projects without any issues.
- **🔔 Event-based**: Ptero WS is event-based, so you can listen to events and handle them accordingly.
- **⚙️ Customizable**: Ptero WS is customizable, so you can change the default settings to your liking.
- **💡 Lightweight**: Ptero WS is lightweight, so it won't slow down your application.

## Installation

1. Install the package using NPM:
   ```bash
   npm install ptero-ws
   ```
2. Import the package in your project using **ES6**:
   ```typescript
   import { pterows } from "ptero-ws";
   ```
   Or use **CommonJS**:
   ```typescript
   const { pterows } = require("ptero-ws");
   ```

## Usage

1. Create a new instance of **Ptero WS**:

   ```typescript
   const socket = new pterows(
     "https://panel.yourdomain.com",
     "CLIENT_KEY",
     "SERVER_ID"
   );
   ```

   Note that we append the following parameters to the class.

   - **https://panel.yourdomain.com**: Your Pterodactyl Panel instance base URL.
   - **CLIENT_KEY**: Your Pterodactyl Panel user's client key.
   - **SERVER_ID**: Your Pterodactyl Panel unique identifier for the server you want to connect to.

   You can also provide an option object to customize the options:

   ```typescript
   {
    debug: false, // Whether or not messages should be displayed in the console when the socket is connected and closed.
   }
   ```

2. Create your first event listener using **Ptero WS**:
   ```typescript
   socket.on("open", () => {
     socket.listen("stats", (data) => {
       console.log(JSON.parse(data));
     });
   });
   ```
   Note that we wrap the inner listener with `socket.on("open")`. This is done to ensure that the socket has fully connected before creating an event listener.
3. Once you have finished using **Ptero WS**, make sure to close the websocket connection to free system resources.
   ```typescript
   socket.close();
   ```

## Listeners

| Name                     | Arguments            | Description                                                |
| ------------------------ | -------------------- | ---------------------------------------------------------- |
| auth success             |                      | The authentication was successful.                         |
| backup complete          |                      | Sent when a backup is complete.                            |
| backup restore completed |                      | Sent when a backup has been restored to the server.        |
| console output           | the output message   | The output from the console (one line).                    |
| daemon error             | the error message    | The daemon received an error (usually with the websocket). |
| daemon message           | the message          | A message from the daemon.                                 |
| install completed        |                      | Sent when a server's installation process is complete.     |
| install output           | the output message   | The output from the installation process.                  |
| install started          |                      | Sent when a server's installation process starts.          |
| jwt error                | the error message    | An error occurred with the authentication token.           |
| stats                    | statistics JSON data | Current statistics about the server.                       |
| status                   | the power state      | The power state of the server.                             |
| token expired            |                      | The token expired; connection will be closed shortly.      |
| token expiring           |                      | Warning event: you should reauthenticate the connection.   |
| transfer logs            | the output log       | The logs from the transfer process.                        |
| transfer status          | the transfer state   | The current transfer status.                               |

## Sendable Events

| Name         | Arguments                             | Description                               |
| ------------ | ------------------------------------- | ----------------------------------------- |
| auth         | the websocket auth token              | Authenticates the websocket connection.   |
| set state    | "start", "stop", "restart", or "kill" | Sets the power state of the server.       |
| send command | the command                           | Sends a command to the server console.    |
| send logs    |                                       | Requests the console logs for the server. |
| send stats   |                                       | Requests the server statistics.           |

## Questions

> [!IMPORTANT]
> Please make sure to check the examples before-hand.

If you have any other questions or need help, feel free to open an issue on the GitHub repository.
