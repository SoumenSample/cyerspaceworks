import { createServer } from "http";
import next from "next";
import { initSocket } from "./lib/socket/server.js";

const app = next({ dev: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handler);

  initSocket(server);

  server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
});