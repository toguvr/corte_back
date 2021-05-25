"use strict";

require("reflect-metadata");

require("dotenv/config");

var _http = require("./http");

require("./websocket/client");

_http.http.listen(3333, () => console.log("Server is running on port 3333"));