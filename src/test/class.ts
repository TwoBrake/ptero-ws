// Resources
import { pteroWebSocket } from "..";
import dotenv from "dotenv";

dotenv.config(); // Make sure environment variables are loaded correctly.

const socket = new pteroWebSocket(
  "https://panel.twobrake.xyz",
  process.env.CLIENT_KEY as string,
  "5bc8b493"
);

setTimeout(() => {
  socket.on("message", (msg) => {
    console.log(JSON.parse(msg.toString("utf-8")));
  });
}, 1000);
