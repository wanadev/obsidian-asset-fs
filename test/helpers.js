"use strict";

var url = require("url");

var expect = require("expect.js");

var testHelpers = require("./test-helpers.js");
var helpers = require("../lib/helpers.js");

describe("helpers", function() {

    describe("readBlobAsBuffer", function() {

        it("read the blob and returns a Buffer", function() {
            var blob = testHelpers.makeBlob([1, 2, 3, 4]);
            return helpers.readBlobAsBuffer(blob)
                .then(function(buffer) {
                    expect(buffer).to.be.a(Buffer);
                    expect(buffer).to.have.length(4);
                    expect(buffer[0]).to.equal(1);
                    expect(buffer[1]).to.equal(2);
                    expect(buffer[2]).to.equal(3);
                    expect(buffer[3]).to.equal(4);
                });
        });

    });

    describe("readBlobAsText", function() {

        it("read the blob and returns a String", function() {
            var blob = testHelpers.makeBlob([0x68, 0x65, 0x6C, 0x6C, 0x6F]);  // hello
            return helpers.readBlobAsText(blob)
                .then(function(text) {
                    expect(text).to.be.a("string");
                    expect(text).to.have.length(5);
                    expect(text).to.equal("hello");
                });
        });

    });

});
