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
  panel.listen("stats", (msg) => {
    console.log(JSON.parse(msg)); // Parse data as JSON as it is sent as a string originally.
  });
});

// Close panel connection after 5 seconds.
setTimeout(() => {
  panel.close();
}, 5000);
