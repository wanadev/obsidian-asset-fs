"use strict";

var Q = require("q");

var DEFAULT_INDEX = {
    fragments: {
        "4854557d-22f6-4727-96f5-7576a98010ed": "4854557d-22f6-4727-96f5-7576a98010ed.oaf",
        "acd75b37-5798-4408-9288-27888eb1535a": "acd75b37-5798-4408-9288-27888eb1535a.png"
    },
    assets: {
        "random-stuff/bin/asset1.bin": {
            offset: 4,
            length: 4,
            mimetype: "application/octet-stream",
            fragment: "4854557d-22f6-4727-96f5-7576a98010ed"
        },
        "random-stuff/bin/asset2.bin": {
            offset: 8,
            length: 4,
            mimetype: "application/octet-stream",
            fragment: "4854557d-22f6-4727-96f5-7576a98010ed"
        },
        "text.txt": {
            offset: 12,
            length: 5,
            mimetype: "text/plain",
            fragment: "4854557d-22f6-4727-96f5-7576a98010ed"
        },
        "data/test.json": {
            offset: 17,
            length: 5,
            mimetype: "application/json",
            fragment: "4854557d-22f6-4727-96f5-7576a98010ed"
        },
        "assets/textures/category/image.png": {
            offset: 0,
            length: 193,
            mimetype: "image/png",
            fragment: "acd75b37-5798-4408-9288-27888eb1535a"
        }
    }
};

var OTHER_INDEX = {
    fragments: {
        "test-fragment": "test-fragment.oaf",
    },
    assets: {
        "test-asset.bin": {
            offset: 0,
            length: 0,
            mimetype: "application/octet-stream",
            fragment: "test-fragment"
        }
    }
};

var FETCHER_DATA = {
    "4854557d-22f6-4727-96f5-7576a98010ed.oaf": Buffer.from("OAF\x01\x00\x01\x02\x03\x04\x05\x06\x07hello{a:1}"),
    "acd75b37-5798-4408-9288-27888eb1535a.png": Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
            0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00,
            0x00, 0x10, 0x02, 0x03, 0x00, 0x00, 0x00, 0x62, 0x9d, 0x17, 0xf2,
            0x00, 0x00, 0x00, 0x09, 0x50, 0x4c, 0x54, 0x45, 0x00, 0x00, 0x00,
            0xff, 0x00, 0x00, 0xff, 0xff, 0xff, 0x67, 0x19, 0x64, 0x1e, 0x00,
            0x00, 0x00, 0x01, 0x62, 0x4b, 0x47, 0x44, 0x00, 0x88, 0x05, 0x1d,
            0x48, 0x00, 0x00, 0x00, 0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00,
            0x0e, 0xc4, 0x00, 0x00, 0x0e, 0xc4, 0x01, 0x95, 0x2b, 0x0e, 0x1b,
            0x00, 0x00, 0x00, 0x07, 0x74, 0x49, 0x4d, 0x45, 0x07, 0xdf, 0x0b,
            0x12, 0x0d, 0x0b, 0x17, 0xca, 0x83, 0x65, 0x00, 0x00, 0x00, 0x00,
            0x3d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x1d, 0x0d, 0xc1, 0xc1, 0x0d,
            0x00, 0x21, 0x0c, 0x03, 0xc1, 0x2d, 0x07, 0xd1, 0x0f, 0xfd, 0x9c,
            0xf2, 0x8a, 0x5c, 0x05, 0xf2, 0x0b, 0xa5, 0xca, 0xf3, 0x0c, 0x27,
            0x98, 0xe0, 0xf3, 0x15, 0x6e, 0x15, 0x2e, 0x0b, 0xeb, 0x09, 0xdf,
            0x32, 0x13, 0x4c, 0x50, 0x7a, 0x43, 0xeb, 0x0d, 0xa5, 0xb5, 0xe9,
            0x6e, 0x51, 0x5a, 0x9b, 0x09, 0x4e, 0xfc, 0x91, 0x4d, 0x22, 0x7f,
            0x72, 0xcc, 0xb0, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
            0x44, 0xae, 0x42, 0x60, 0x82, 0x0a]),
    "default-index.json": Buffer.from(JSON.stringify(DEFAULT_INDEX)),
    "other-index.json": Buffer.from(JSON.stringify(OTHER_INDEX))
};

function fakeDataFetcher(url) {
    var k = url.split("/").pop();
    if (!FETCHER_DATA[k]) {
        return Q.reject(new Error("HttpStatus404"));
    }
    return Q(FETCHER_DATA[k]);
}

// Read a Blob as Buffer using FileReader,
// returns a Promise.
function readBlobAsBuffer(blob) {
    return Q.Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onload = function(event) {
            resolve(Buffer.from(event.target.result));
        };
        reader.readAsArrayBuffer(blob);
    });
}

// Makes a Blob from an Array
// returns a Blob.
function makeBlob(arr, type) {
    type = type || "application/octet-stream";
    return new Blob([new Uint8Array(arr)], {type: type});
}

module.exports = {
    DEFAULT_INDEX: DEFAULT_INDEX,
    OTHER_INDEX: OTHER_INDEX,
    fakeDataFetcher: fakeDataFetcher,
    readBlobAsBuffer: readBlobAsBuffer,
    makeBlob: makeBlob
};
