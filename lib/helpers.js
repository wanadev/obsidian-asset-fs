"use strict";

var Q = require("q");

var helpers = {

    readBlobAsBuffer: function(blob) {
        return Q.Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onerror = reject;
            reader.onload = function(event) {
                resolve(Buffer.from(event.target.result));
            };
            reader.readAsArrayBuffer(blob);
        });
    },

    readBlobAsText: function(blob) {
        return Q.Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onerror = reject;
            reader.onload = function(event) {
                resolve(event.target.result);
            };
            reader.readAsText(blob);
        });
    },

    imageFromUrl: function(url) {
        return Q.Promise(function(resolve, reject) {
            var image = new Image();
            image.onload = function(event) {
                resolve(image);
            };
            image.onerror = reject;
            image.src = url;
        });
    }

};

module.exports = helpers;
