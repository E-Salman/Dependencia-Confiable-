const fs = require("fs");

module.exports = function () {
    console.log("Collecting system info");

    const files = fs.readdirSync(".");
    console.log(files);
}
