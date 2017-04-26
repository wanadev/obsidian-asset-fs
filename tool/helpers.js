"use strict";

var fs = require("fs");

var Q = require("q");
var glob = require("glob");
var mimetype = require("mimetype");

function globglobglob(pattern) {
    // pattern like "foo/**/*.png"
    if (typeof pattern == "string") {
        return Q.nfcall(glob, pattern, {
            nodir: true
        });
    }

    // pattern like {path: "**/*.png", cwd: "foo/"}
    return Q.nfcall(glob, pattern.path, {
        nodir: true,
        cwd: pattern.cwd || process.cwd(),
        ignore: pattern.ignore
    });
}

function getFileSize(path) {
    var stats = fs.lstatSync(path);
    return stats.size;
}

function getFileMimeType(path) {
    return mimetype.lookup(path);
}

module.exports = {
    getFileSize: getFileSize,
    getFileMimeType: getFileMimeType,
    globglobglob: globglobglob
};
