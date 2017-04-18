"use strict";

var url = require("url");

var expect = require("expect.js");

var AssetFs = require("../lib/asset-fs.js");
var testHelpers = require("./test-helpers.js");

describe("AssetFs", function() {

    beforeEach(function() {
        this.assetFs = new AssetFs();
        this.assetFs.setDataFetcher(testHelpers.fakeDataFetcher);
        this.assetFs.addIndexFromUrl("/index.json");
    });

    describe("setDataFetcher", function() {

        it("should change the data fetcher function that will be called to fetch fragments", function(done) {
            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.match(/^.*4854557d-22f6-4727-96f5-7576a98010ed\.oaf$/);
                done();
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
                expect(url).to.equal(url.resolve(location.href, "test-fragment.oaf"));
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given ABSOLUTE root URL if provided", function(done) {
            this.assetFs.addIndex(testHelpers.OTHER_INDEX, "http://example.com/");

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal("http://example.com/test-fragment.oaf");
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given RELATIVE root URL if provided", function(done) {
            var root = "./folder/";
            var resolvedRoot = url.resolve(location.href, root);

            this.assetFs.addIndex(testHelpers.OTHER_INDEX, root);

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(url.resolve(resolvedRoot, "test-fragment.oaf"));
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

    });

    describe("addIndexFromUrl", function() {

        it("should add the given index", function() {
            this.assetFs.addIndexFromUrl("http://example.org/assets/other-index.json");

            expect(this.assetFs.assetExists("test-asset.bin")).to.be.ok();
        });

        it("should resolve the fragments URLs from the URL of the index file by default", function(done) {
            var indexUrl = "http://example.org/assets/other-index.json";
            this.assetFs.addIndexFromUrl(indexUrl);

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(url.resolve(indexUrl, "test-fragment.oaf"));
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given ABSOLUTE root URL if provided", function(done) {
            var indexUrl = "http://example.org/assets/other-index.json";
            this.assetFs.addIndexFromUrl(indexUrl, "http://foo.example.com/");

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal("http://foo.example.com/test-fragment.oaf");
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
        });

        it("should resolve the fragments URLs from the given RELATIVE root URL if provided", function(done) {
            var indexUrl = "http://example.org/assets/other-index.json";
            var root = "./folder/";
            var resolvedRoot = url.resolve(location.href, root);

            this.assetFs.addIndexFromUrl(indexUrl, root);

            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(url.resolve(resolvedRoot, "test-fragment.oaf"));
                done();
            });
            this.assetFs.preloadAsset("test-asset.bin");
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
            expect(this.assetFs.assetLoaded("random-stuff/bin/asset1.bin")).to.no.be.ok();
        });

        it("sould return a truthy value if the asset is loaded", function() {
            return this.assetFs.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function() {
                    expect(this.assetFs.assetLoaded("random-stuff/bin/asset1.bin")).to.be.ok();
                });
        });

    });

    describe("preloadAsset", function() {

        it("should preload requested assets", function(done) {
            this.assetFs.setDataFetcher(function(url) {
                expect(url).to.equal(url.resolve(location.href, "4854557d-22f6-4727-96f5-7576a98010ed.oaf"));
                done();
            });
            this.assetFs.preloadAsset("random-stuff/bin/asset1.bin");
        });

    });

    describe("getAssetAsBlob", function() {

        it("returns the asset as a Blob", function() {
            return this.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function(assetBlob) {
                    expect(assetBlob).to.be.a(Blob);
                    expect(assetBlob.size).to.equal(4);
                    expect(assetBlob.type).to.equal("application/octet-stream");
                });
        });

        it("returns always the same Blob instance", function() {
            var blob = null;

            return this.getAssetAsBlob("random-stuff/bin/asset1.bin")
                .then(function(assetBlob) {
                    blob = assetBlob;
                    expect(assetBlob).to.be.a(Blob);
                })
                .then(this.getAssetAsBlob.bind(undefined, "random-stuff/bin/asset1.bin"))
                .then(function(assetBlob) {
                    expect(assetBlob).to.be.a(Blob);
                    expect(assetBlob).to.be(blob);
                });
        });

        it("returns the right data in the Blob", function() {
            return this.getAssetAsBlob("random-stuff/bin/asset1.bin")
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
            return this.getAssetAsBlob("foo")
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
            return this.getAssetAsBlobUrl("random-stuff/bin/asset1.bin")
                .then(function(assetBlobUrl) {
                    expect(assetBlobUrl).to.be.a(String);
                });
        });

        it("returns always the same Blob URL", function() {
            var url = null;

            return this.getAssetAsBlobUrl("random-stuff/bin/asset1.bin")
                .then(function(assetBlobUrl) {
                    url = assetBlobUrl;
                    expect(assetBlobUrl).to.be.a(String);
                })
                .then(this.getAssetAsBlobUrl.bind(undefined, "random-stuff/bin/asset1.bin"))
                .then(function(assetBlobUrl) {
                    expect(assetBlobUrl).to.be.a(String);
                    expect(assetBlobUrl).to.equal(url);
                });
        });

        it("reject the promise if the asset is not referenced", function() {
            return this.getAssetAsBlobUrl("foo")
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
            return this.getAssetAsBuffer("random-stuff/bin/asset2.bin")
                .then(function(assetBuffer) {
                    expect(assetBuffer).to.be.a(Buffer);
                    expect(assetBuffer).to.have.length(4);
                    expect(assetBuffer).to.eql([4, 5, 6, 7]);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.getAssetAsBuffer("foo")
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
            return this.getAssetAsImage("assets/textures/category/image.png")
                .then(function(assetImage) {
                    expect(assetImage).to.be.an(Image);
                });
        });

        it("rejects the promise if the asset is not an image", function() {
            return this.getAssetAsImage("random-stuff/bin/asset1.bin")
                .then(function(assetImage) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).not.to.match(/ShouldNotBeRaised/);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.getAssetAsImage("foo")
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
            return this.getAssetAsText("text.txt")
                .then(function(assetText) {
                    expect(assetText).to.be.a("string");
                    expect(assetText).to.have.length(5);
                    expect(assetText).to.equal("hello");
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.getAssetAsText("foo")
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
            return this.getAssetAsObject("assets/textures/category/image.png")
                .then(function(assetObject) {
                    expect(assetObject).to.be.an("object");
                    expect(assetObject.a).to.equal(1);
                });
        });

        it("rejects the promise if the asset is not a valid JSON object", function() {
            return this.getAssetAsObject("random-stuff/bin/asset1.bin")
                .then(function(assetObject) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).not.to.match(/ShouldNotBeRaised/);
                });
        });

        it("rejects the promise if the asset is not referenced", function() {
            return this.getAssetAsObject("foo")
                .then(function(assetObject) {
                    throw new Error("ShouldNotBeRaised");
                })
                .catch(function(error) {
                    expect(error).to.match(/UnreferencedAssetError/);
                });
        });

    });

});
