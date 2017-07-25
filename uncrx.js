const unzip = require("unzip-crx");
const path = require("path");

const crxFile = process.argv[process.argv.length - 1];

unzip(crxFile, './output').then(() => {
  console.log("Successfully unzipped your crx file..");
});
