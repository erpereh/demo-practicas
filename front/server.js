const path = require("path");

const standaloneDir = path.join(__dirname, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

process.chdir(standaloneDir);
require(standaloneServer);
