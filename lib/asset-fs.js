"use strict";

var url = require("url");
var Class = require("abitbol");
var Q = require("q");

var helpers = require("./helpers.js");

var AssetFs = Class.$extend({

    __init__: function() {
        this.$data.dataFetcher = null;
        this.$data.fragments = {};
        this.$data.assets = {};
    },

    setDataFetcher: function(fetcher) {
        this.$data.dataFetcher = fetcher;
    },

    addIndex: function(index, rootUrl) {
        rootUrl = rootUrl || url.resolve(global.location.href, "./");
        rootUrl = url.resolve(global.location.href, rootUrl);

        if (!index.fragments) {
            throw new Error("InvalidIndex: missing 'fragments' section.");
        }

        if (!index.assets) {
            throw new Error("InvalidIndex: missing 'assets' section.");
        }

        var fragmentIds = Object.keys(index.fragments);
        for (var i=0 ; i<fragmentIds.length ; i++) {
            var fragmentId = fragmentIds[i];
            var fragmentUrl = url.resolve(rootUrl, index.fragments[fragmentId]);
            this.$data.fragments[fragmentId] = {
                url: fragmentUrl,
                loadingPromise: null,
                blob: null
            };
        }

        var assetIds = Object.keys(index.assets);
        for (i=0 ; i<assetIds.length ; i++) {
            var assetPath = assetIds[i];
            var asset = index.assets[assetPath];

            if (index.assets[assetPath].offset === undefined) {
                throw new Error("InvalidIndex: missing 'offset' property of '" + assetPath + "' asset.");
            }

            if (index.assets[assetPath].length === undefined) {
                throw new Error("InvalidIndex: missing 'length' property of '" + assetPath + "' asset.");
            }

            if (index.assets[assetPath].fragment === undefined) {
                throw new Error("InvalidIndex: missing 'fragment' property of '" + assetPath + "' asset.");
            }

            this.$data.assets[assetPath] = {
                offset: index.assets[assetPath].offset,
                length: index.assets[assetPath].length,
                mimetype: index.assets[assetPath].mimetype || "application/octet-stream",
                fragment: index.assets[assetPath].fragment,
                blob: null,
                blobUrl: null
            };
        }
    },

    addIndexFromUrl: function(indexUrl, rootUrl) {
        indexUrl = url.resolve(global.location.href, indexUrl);
        rootUrl = rootUrl || url.resolve(indexUrl, "./");

        var _this = this;

        return this.$data.dataFetcher(indexUrl)
            .then(function(indexBuffer) {
                var indexString = indexBuffer.toString();
                var index = JSON.parse(indexString);
                return index;
            })
            .then(function(index) {
                _this.addIndex(index, rootUrl);
            });
    },

    assetExists: function(assetPath) {
        return Boolean(this.$data.assets[assetPath]);
    },

    assetLoaded: function(assetPath) {
        if (!this.assetExists(assetPath)) {
            return false;
        }

        var fragmentId = this.$data.assets[assetPath].fragment;
        return (this.$data.fragments[fragmentId] && this.$data.fragments[fragmentId].blob);
    },

    preloadAsset: function(assetPath) {
        if (!this.assetExists(assetPath)) {
            throw new Error("UnreferencedAssetError: unreferenced asset '" + assetPath + "'");
        }

        var fragmentId = this.$data.assets[assetPath].fragment;
        this._getFragmentBlob(fragmentId)
            .done();
    },

    getAssetAsBlob: function(assetPath) {
        if (!this.assetExists(assetPath)) {
            return Q.reject(new Error("UnreferencedAssetError: unreferenced asset '" + assetPath + "'"));
        }

        var asset = this.$data.assets[assetPath];

        if (asset.blob) {
            return Q(asset.blob);
        }

        function _sliceAssetBlob(fragmentBlob) {
            asset.blob = fragmentBlob.slice(asset.offset, asset.offset + asset.length, asset.mimetype);
            return asset.blob;
        }

        return this._getFragmentBlob(asset.fragment)
            .then(_sliceAssetBlob);
    },

    getAssetAsBlobUrl: function(assetPath) {
        if (!this.assetExists(assetPath)) {
            return Q.reject(new Error("UnreferencedAssetError: unreferenced asset '" + assetPath + "'"));
        }

        var asset = this.$data.assets[assetPath];

        if (asset.blobUrl) {
            return Q(asset.blobUrl);
        }

        function _createAssetBlobUrl(assetBlob) {
            asset.blobUrl = URL.createObjectURL(assetBlob);
            return asset.blobUrl;
        }

        return this.getAssetAsBlob(assetPath)
            .then(_createAssetBlobUrl);
    },

    getAssetAsBuffer: function(assetPath) {
        return this.getAssetAsBlob(assetPath)
            .then(helpers.readBlobAsBuffer);
    },

    getAssetAsImage: function(assetPath) {
        throw new Error("NotImplementedError");
    },

    getAssetAsText: function(assetPath) {
        return this.getAssetAsBlob(assetPath)
            .then(helpers.readBlobAsText);
    },

    getAssetAsObject: function(assetPath) {
        return this.getAssetAsBlob(assetPath)
            .then(helpers.readBlobAsText)
            .then(JSON.parse);
    },

    // TODO Audio, Video

    _getFragmentBlob: function(fragmentId) {
        if (!this.$data.fragments[fragmentId]) {
            throw new Error("UnregisteredFragment: the '" + fragmentId + "' fragment is not registered to the index.");
        }

        var _this = this;
        var fragment = this.$data.fragments[fragmentId];

        // Already loaded

        if (fragment.blob) {
            return Q(fragment.blob);
        }

        // Loading

        if (fragment.loadingPromise) {
            return fragment.loadingPromise
                .then(function() {
                    return fragment.blob;
                });
        }

        // Not loaded yet

        function _downloadFragment() {
            fragment.loadingPromise = _this.$data.dataFetcher(fragment.url);
            return fragment.loadingPromise;
        }

        function _makeFragmentBlob(fragmentBuffer) {
            fragment.blob = new Blob([fragmentBuffer], {type: "application/x-obsidian-asset-fragment"});
            fragment.loadingPromise = null;
            return fragment.blob;
        }

        return _downloadFragment()
            .then(_makeFragmentBlob);
    }

});

module.exports = AssetFs;
