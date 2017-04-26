"use strict";

var path = require("path");

var Q = require("q");
var lodash = require("lodash");

var helpers = require("./helpers.js");
var assets = require("./assets.js");
var fsIndex = require("./fs-index.js");
var fragment = require("./fragment.js");

function generateFromPath(paths, options) {
    options = lodash.merge({
        fragmentSize: 2 * 1024 * 1024,  // 2 Mio
        outputFolder: process.cwd(),
        outputIndexFile: "index.json",
        quiet: false
    }, options);

    function _printFragmentDetail(fragmentFileName, assets) {
        if (options.quiet) {
            return;
        }

        console.log("* " + fragmentFileName);

        for (var i = 0 ; i < assets.length ; i++) {
            console.log("  * " + assets[i]._assetPath + "  (" + assets[i]._filePath + ")");
        }
    }

    function _createIndex(assets) {
        return fsIndex.create(assets, options);
    }

    function _generateFragments(index) {
        var promises = [];

        for (var fragmentId in index._assetsByFragment) {
            promises.push(
                fragment.create(index._assetsByFragment[fragmentId])
                    .then(fragment.write.bind(undefined, path.join(options.outputFolder, index.fragments[fragmentId])))
                    .then(_printFragmentDetail.bind(undefined, index.fragments[fragmentId], index._assetsByFragment[fragmentId]))
            );
        }

        return Q.all(promises)
            .then(function() {
                return index;
            });
    }

    function _exportIndex(index) {
        var output = path.join(options.outputFolder, options.outputIndexFile);
        return fsIndex.clean(index)
            .then(function(index) {
                return fsIndex.write(output, index);
            });
    }

    return assets.list(paths)
        .then(_createIndex)
        .then(_generateFragments)
        .then(_exportIndex);

}

module.exports = {
    helpers: helpers,
    assets: assets,
    index: fsIndex,
    fragment: fragment,
    generateFromPath: generateFromPath
};
