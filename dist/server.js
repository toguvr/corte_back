"use strict";

require("reflect-metadata");

require("dotenv/config");

var _http = require("./http");

require("./websocket/client");

_http.http.listen(process.env.PORT || 3333, () => console.log("Server is running on port 3333"));