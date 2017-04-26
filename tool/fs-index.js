"use strict";

var fs = require("fs");

var Q = require("q");
var uuid = require("uuid");
var lodash = require("lodash");

function createIndex(assets, options) {
    options = lodash.merge({
        fragmentHeaderLength: 4,
        fragmentSize: 2 * 1024 * 1024  // 2 Mio
    }, options);

    var index = {
        fragments: {},
        assets: {},
        _assetsByFragment: {}
    };

    var currentFragmentSize = options.fragmentHeaderLength;
    var currentFragmentAssets = [];
    var currentFragmentId = uuid.v4();

    for (var i = 0 ; i < assets.length ; i++) {
        var asset = assets[i];

        asset.offset = currentFragmentSize;
        asset.fragment = currentFragmentId;

        currentFragmentSize += asset.length;

        index.assets[asset._assetPath] = asset;
        currentFragmentAssets.push(asset);

        if (currentFragmentSize > options.fragmentSize) {
            index.fragments[currentFragmentId] = currentFragmentId + ".oaf";
            index._assetsByFragment[currentFragmentId] = currentFragmentAssets;

            currentFragmentSize = options.fragmentHeaderLength;
            currentFragmentAssets = [];
            currentFragmentId = uuid.v4();
        }
    }

    if (currentFragmentSize > options.fragmentHeaderLength) {
        index.fragments[currentFragmentId] = currentFragmentId + ".oaf";
        index._assetsByFragment[currentFragmentId] = currentFragmentAssets;
    }

    return Q(index);
}

function cleanIndex(index) {
    delete index._assetsByFragment;

    for (var assetPath in index.assets) {
        delete index.assets[assetPath]._filePath;
        delete index.assets[assetPath]._assetPath;
    }

    return Q(index);
}

function writeIndex(path, index) {
    var sIndex = JSON.stringify(index);
    return Q.nfcall(fs.writeFile, path, sIndex);
}

module.exports = {
    create: createIndex,
    clean: cleanIndex,
    write: writeIndex
};
