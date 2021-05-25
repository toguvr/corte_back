import "reflect-metadata";
import "dotenv/config";
import { http } from "./http";

import "./websocket/client";

http.listen(process.env.PORT || 3333, () =>
  console.log("Server is running on port 3333")
);
