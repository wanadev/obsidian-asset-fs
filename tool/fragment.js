"use strict";

var fs = require("fs");

var Q = require("q");
var lodash = require("lodash");

var FRAGMENT_HEADER = Buffer.from([0x4F, 0x41, 0x46, 0x01]);

function _getAssetsBuffers(assets) {
    var promises = [];

    for (var i = 0 ; i < assets.length ; i++) {
        promises.push(Q.nfcall(fs.readFile, assets[i]._filePath));
    }

    return Q.all(promises);
}

function createFragment(assets) {
    return Q(assets)
        .then(_getAssetsBuffers)
        .then(function(assetsData) {
            var buffers = lodash.concat([FRAGMENT_HEADER], assetsData);
            return Buffer.concat(buffers);
        });
}

function writeFragment(path, fragment) {
    return Q.nfcall(fs.writeFile, path, fragment);
}

module.exports = {
    _getAssetsBuffers: _getAssetsBuffers,
    create: createFragment,
    write: writeFragment
};
