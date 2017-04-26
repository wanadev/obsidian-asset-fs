"use strict";

var path = require("path");

var Q = require("q");
var lodash = require("lodash");

var helpers = require("./helpers.js");

function _assetListToRecord(cwd, assetList) {
    if (cwd) {
        cwd = path.resolve(process.cwd(), cwd);
    } else {
        cwd = process.cwd();
    }

    var assets = [];

    for (var i = 0 ; i < assetList.length ; i++) {
        assets.push({
            _filePath: path.resolve(cwd, assetList[i]),
            _assetPath: assetList[i],
            offset: null,
            length: null,
            mimetype: null,
            fragment: null
        });
    }

    return Q(assets);
}

function _getAssetInfos(assets) {
    for (var i = 0 ; i < assets.length ; i++) {
        var asset = assets[i];
        asset.length = helpers.getFileSize(asset._filePath);
        asset.mimetype = helpers.getFileMimeType(asset._filePath);
    }

    return Q(assets);
}

function listAssets(paths) {
    var promises = [];

    for (var i = 0 ; i < paths.length ; i++) {
        promises.push(helpers.globglobglob(paths[i])
            .then(_assetListToRecord.bind(undefined, paths[i].cwd))
            .then(_getAssetInfos)
        );
    }

    return Q.all(promises)
        .then(function(assets) {
            return lodash.flatten(assets);
        });
}

module.exports = {
    _assetListToRecord: _assetListToRecord,
    _getAssetInfos: _getAssetInfos,
    list: listAssets,
};
