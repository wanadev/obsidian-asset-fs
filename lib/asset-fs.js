"use strict";

var Class = require("abitbol");

var AssetFs = Class.$extend({

    __init__: function() {
    },

    setDataFetcher: function(fetcher) {
        throw new Error("NotImplementedError");
    },

    addIndex: function(index, rootUrl) {
        // default: rootUrl = current page's folder
        throw new Error("NotImplementedError");
    },
    addIndexFromUrl: function(url, rootUrl) {
        // default: rootUrl = index json folder folder
        throw new Error("NotImplementedError");
    },

    assetExists: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    assetLoaded: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    preloadAsset: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsBlob: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsBlobUrl: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsBuffer: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsImage: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsText: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsObject: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    // TODO Audio, Video

});

module.exports = AssetFs;
