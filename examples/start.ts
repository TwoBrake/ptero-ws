// Resources
import { pterows } from "../src";
import dotenv from "dotenv";

dotenv.config(); // Make sure environment variables are loaded correctly.

const panel = new pterows(
  "https://panel.twobrake.xyz",
  process.env.CLIENT_KEY as string, // Load environment variable with key of CLIENT_KEY holding your user's client key.
  "5bc8b493",
  { debug: true } // Optional parameter to include logging when the socket connects and closes.
);

// Give socket time to establish connection, then create event listener.
panel.on("open", () => {
  panel.send("set state", ["start"]); // Set server state to "starting".
  panel.close(); // Close connection to websocket after we have sent the event.
});
