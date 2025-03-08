const app = require("./server");
const http = require("http");
const config = require("./utils/config");

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

