// Resources
import { pteroWebSocket } from "../src";
import dotenv from "dotenv";

dotenv.config(); // Make sure environment variables are loaded correctly.

const socket = new pteroWebSocket(
  "https://panel.twobrake.xyz",
  process.env.CLIENT_KEY as string,
  "5bc8b493",
  { debug: true }
);

setTimeout(() => {
  socket.on("stats", (msg) => {
    console.log(JSON.parse(msg));
  });

  // socket.send("set state", ["start"]);
}, 1000);
