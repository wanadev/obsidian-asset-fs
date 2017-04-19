"use strict";

var nodeUrl = require("url");

var Q = require("q");
var expect = require("expect.js");

var AssetFs = require("../lib/asset-fs.js");
var testHelpers = require("./test-helpers.js");

describe("AssetFs", function() {

    beforeEach(function() {
        this.assetFs = new AssetFs();
        this.assetFs.setDataFetcher(testHelpers.fakeDataFetcher);
        return this.assetFs.addIndexFromUrl("default-index.json");
    });

    describe("setDataFetcher", function() {

        it("should change the data fetcher function that will be called to fetch fragments", function(done) {
            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.match(/^.*4854557d-22f6-4727-96f5-7576a98010ed\.oaf$/);
                done();
                return Q();
            });
            this.assetFs.preloadAsset("random-stuff/bin/asset1.bin");
        });

    });

    describe("addIndex", function() {

        it("should add the given index", function() {
            this.assetFs.addIndex(testHelpers.OTHER_INDEX);

            expect(this.assetFs.assetExists("test-asset.bin")).to.be.ok();
        });

        it("should resolve the fragments URLs from the current page by default", function(done) {
            this.assetFs.addIndex(testHelpers.OTHER_INDEX);

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(nodeUrl.resolve(global.location.href, "test-fragment.oaf"));
                done();
                return Q();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given ABSOLUTE root URL if provided", function(done) {
            this.assetFs.addIndex(testHelpers.OTHER_INDEX, "http://example.com/");

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal("http://example.com/test-fragment.oaf");
                done();
                return Q();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given RELATIVE root URL if provided", function(done) {
            var root = "./folder/";
            var resolvedRoot = nodeUrl.resolve(global.location.href, root);

            this.assetFs.addIndex(testHelpers.OTHER_INDEX, root);

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(nodeUrl.resolve(resolvedRoot, "test-fragment.oaf"));
                done();
                return Q();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

    });

    describe("addIndexFromUrl", function() {

        it("should add the given index", function() {
            var _this = this;

            return this.assetFs.addIndexFromUrl("http://example.org/assets/other-index.json")
                .then(function() {
                    expect(_this.assetFs.assetExists("test-asset.bin")).to.be.ok();
                });
        });

        it("should resolve the fragments URLs from the URL of the index file by default", function(done) {
            var _this = this;
            var indexUrl = "http://example.org/assets/other-index.json";

            this.assetFs.addIndexFromUrl(indexUrl)
                .then(function() {
                    _this.assetFs.setDataFetcher(function(url) {
                        expect(url).to.equal(nodeUrl.resolve(indexUrl, "test-fragment.oaf"));
                        done();
                        return Q();
                    });
                    _this.assetFs.preloadAsset("test-asset.bin");
                });
        });

        it("should resolve the fragments URLs from the given ABSOLUTE root URL if provided", function(done) {
            var _this = this;
            var indexUrl = "http://example.org/assets/other-index.json";

            this.assetFs.addIndexFromUrl(indexUrl, "http://foo.example.com/")
                .then(function() {
                    _this.assetFs.setDataFetcher(function(url) {
                        expect(url).to.equal("http://foo.example.com/test-fragment.oaf");
                        done();
                        return Q();
                    });
                    _this.assetFs.preloadAsset("test-asset.bin");
                });
        });

        it("should resolve the fragments URLs from the given RELATIVE root URL if provided", function(done) {
            var _this = this;
            var indexUrl = "http://example.org/assets/other-index.json";
            var root = "./folder/";
            var resolvedRoot = nodeUrl.resolve(global.location.href, root);

            this.assetFs.addIndexFromUrl(indexUrl, root)
                .then(function() {
                    _this.assetFs.setDataFetcher(function(url) {
                        expect(url).to.equal(nodeUrl.resolve(resolvedRoot, "test-fragment.oaf"));
                        done();
                        return Q();
                    });
                    _this.assetFs.preloadAsset("test-asset.bin");
                });
        });

    });

    describe("assetExists", function() {

        it("should return a truthy value if the asset exists", function() {
            expect(this.assetFs.assetExists("random-stuff/bin/asset2.bin")).to.be.ok();
        });

        it("should return a falsy value if the asset exists", function() {
            expect(this.assetFs.assetExists("foo")).not.to.be.ok();
        });

    });

    describe("assetLoaded", function() {

        it("should return a falsy value if the asset is not loaded", function() {
            expect(this.assetFs.assetLoaded("random-stuff/bin/asset1.bin")).not.to.be.ok();
        });

        it("sould return a truthy value if the asset is loaded", function() {
            var _this = this;

            return this.assetFs.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function() {
                    expect(_this.assetFs.assetLoaded("random-stuff/bin/asset1.bin")).to.be.ok();
                });
        });

    });

    describe("preloadAsset", function() {

        it("should preload requested assets", function(done) {
            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(nodeUrl.resolve(global.location.href, "4854557d-22f6-4727-96f5-7576a98010ed.oaf"));
                done();
                return Q();
            });
            this.assetFs.preloadAsset("random-stuff/bin/asset1.bin");
        });

    });

    describe("getAssetAsBlob", function() {

        it("returns the asset as a Blob", function() {
            return this.assetFs.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function(assetBlob) {
                    expect(assetBlob).to.be.a(Blob);
                    expect(assetBlob.size).to.equal(4);
                    expect(assetBlob.type).to.equal("application/octet-stream");
                });
        });

        it("returns always the same Blob instance", function() {
            var blob = null;

            return this.assetFs.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function(assetBlob) {
                    blob = assetBlob;
                    expect(assetBlob).to.be.a(Blob);
                })
                .then(this.assetFs.getAssetAsBlob.bind(undefined, "random-stuff/bin/asset1.bin"))
                .then(function(assetBlob) {
                    expect(assetBlob).to.be.a(Blob);
                    expect(assetBlob).to.be(blob);
                });
        });

        it("returns the right data in the Blob", function() {
            return this.assetFs.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(testHelpers.readBlobAsBuffer)
                .then(function(assetBuffer) {
                    expect(assetBuffer).to.have.length(4);
                    expect(assetBuffer[0]).to.equal(0);
                    expect(assetBuffer[1]).to.equal(1);
                    expect(assetBuffer[2]).to.equal(2);
                    expect(assetBuffer[3]).to.equal(3);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsBlob("foo")
                .then(function(assetBlob) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

    describe("getAssetAsBlobUrl", function() {

        it("returns the asset as a Blob URL", function() {
            return this.assetFs.getAssetAsBlobUrl("random-stuff/bin/asset1.bin")
                .then(function(assetBlobUrl) {
                    expect(assetBlobUrl).to.be.a("string");
                });
        });

        it("returns always the same Blob URL", function() {
            var url = null;

            return this.assetFs.getAssetAsBlobUrl("random-stuff/bin/asset1.bin")
                .then(function(assetBlobUrl) {
                    url = assetBlobUrl;
                    expect(assetBlobUrl).to.be.a("string");
                })
                .then(this.assetFs.getAssetAsBlobUrl.bind(undefined, "random-stuff/bin/asset1.bin"))
                .then(function(assetBlobUrl) {
                    expect(assetBlobUrl).to.be.a("string");
                    expect(assetBlobUrl).to.equal(url);
                });
        });

        it("reject the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsBlobUrl("foo")
                .then(function(assetBlobUrl) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

    describe("getAssetAsBuffer", function() {

        it("returns the asset as a Buffer", function() {
            return this.assetFs.getAssetAsBuffer("random-stuff/bin/asset2.bin")
                .then(function(assetBuffer) {
                    expect(assetBuffer).to.be.a(Buffer);
                    expect(assetBuffer).to.have.length(4);
                    expect(assetBuffer[0]).to.equal(4);
                    expect(assetBuffer[1]).to.equal(5);
                    expect(assetBuffer[2]).to.equal(6);
                    expect(assetBuffer[3]).to.equal(7);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsBuffer("foo")
                .then(function(assetBuffer) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

    describe("getAssetAsImage", function() {

        it("returns the asset as a Image", function() {
            return this.assetFs.getAssetAsImage("assets/textures/category/image.png")
                .then(function(assetImage) {
                    expect(assetImage).to.be.an(Image);
                });
        });

        it("rejects the promise if the asset is not an image", function() {
            return this.assetFs.getAssetAsImage("random-stuff/bin/asset1.bin")
                .then(function(assetImage) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).not.to.match(/ShouldNotBeRaised/);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsImage("foo")
                .then(function(assetImage) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

    describe("getAssetAsText", function() {

        it("returns the asset as a string", function() {
            return this.assetFs.getAssetAsText("text.txt")
                .then(function(assetText) {
                    expect(assetText).to.be.a("string");
                    expect(assetText).to.have.length(5);
                    expect(assetText).to.equal("hello");
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsText("foo")
                .then(function(assetText) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

    describe("getAssetAsObject", function() {

        it("returns the asset as an Object", function() {
            return this.assetFs.getAssetAsObject("data/test.json")
                .then(function(assetObject) {
                    expect(assetObject).to.be.an("object");
                    expect(assetObject.a).to.equal(1);
                });
        });

        it("rejects the promise if the asset is not a valid JSON object", function() {
            return this.assetFs.getAssetAsObject("random-stuff/bin/asset1.bin")
                .then(function(assetObject) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).not.to.match(/ShouldNotBeRaised/);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.assetFs.getAssetAsObject("foo")
                .then(function(assetObject) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

});
