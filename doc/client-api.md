---
title: Client Libray API
menuOrder: 20
autotoc: true
---

# Client Library API

To use **Obsidian Asset FS**, you have at least to instantiate it, to define
a data fetcher and to add one or more indexes.

```javascript
const {AssetFs} = require("obsidian-asset-fs");

const assetFs = new AssetFs();

assetFs.setDataFetcher(yourDataFetcherFunction);  // see bellow
assetFs.addIndex(yourIndexObject);

assetFs.getAssetAsBlob("path/to/your/asset")
    .then(assetBlob => console.log(assetBlob))
    .done();
```

## Data Fetcher Function

**Obsidian Asset FS** requires a fetcher function to be able to get data (most
often it is for downloading asset using AJAX).

### AssetFs#setDataFetcher

Defines the data fetcher function to use.

```javascript
assetFs.setDataFetcher(fetcher)  // -> undefined
```

**Params:**

* `fetcher: Function`: The function that will download files:

```javascript
function dataFetcher(url) {
    // Returns a promises that return a Node.js Buffer as return value.
}
```

__NOTE:__ You can use `getRaw` and `getRawProwy` functions from
[obsidian-http-request][] as fetcher.

[obsidian-http-request]: https://github.com/wanadev/obsidian-http-request


## Adding Indexes

### AssetFs#AddIndex

Register assets from an object.

```javascrtipt
assetFs.addIndex(index, rootUrl=undefined)  // -> undefined
```

**Params:**

* `index: Object`: the index (see below for the format)
* _(optional)_ `rootUrl: String`: the root URL to resolves paths of the
  fragments inside the index. By default, the URL of the current page will be
  used as root URL.

### AssetFs#AddIndexFromUrl

Register assets from a JSON file.

```javascrtipt
assetFs.addIndexFromUrl(indexUrl, rootUrl=undefined)  // -> Promise [undefined]
```

**Params:**

* `indexUrl: String`: the index JSON's URL (see below for the format)
* _(optional)_ `rootUrl: String`: the root URL to resolves paths of the
  fragments inside the index. By default, the URL of the index file will be
  used as root URL.

**Throws:**

* `MissingDataFetcher`: No data fetcher was registered.


### Index Format

Indexes are JSON File or Javascript objects that lists available assets:

```javasctipt
{
    fragments: {
        //                                       Here, the URL to the files will be  ↓ ↓ ↓
        //                                       resolved using given "rootUrl"      ↓ ↓ ↓
        "4854557d-22f6-4727-96f5-7576a98010ed": "4854557d-22f6-4727-96f5-7576a98010ed.oaf",
        "acd75b37-5798-4408-9288-27888eb1535a": "acd75b37-5798-4408-9288-27888eb1535a.png"
    },
    assets: {
        "random-stuff/bin/asset1.bin": {                       // Asset path
            offset: 4,                                         // Asset offset from the packages start
            length: 4,                                         // Asset length
            mimetype: "application/octet-stream",              // Asset mimetype
            fragment: "4854557d-22f6-4727-96f5-7576a98010ed"   // Id of the fragment containing the asset
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
            length: 7,
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
}
```


## Checking Assets

### AssetFs#assetExists

Checks if the given asset exists (if it is listed in the loaded indexes).

```javascript
assetFs.assetExists(assetPath);  // -> Boolean
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Boolean`


### AssetFs#AssetLoaded

Checks if the given asset is loaded (already downloaded).

```javascript
assetFs.assetLoaded(assetPath);  // -> Boolean
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Boolean`


## Preloading Assets

### AssetFs#preloadAsset

Preload (download) the fragment containing the given asset.

```javascript
assetFs.preloadAsset(assetPath)  // -> undefined
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")


## Getting Assets

### AssetFs#getAssetAsBlob

Get the asset as a [Blob][].

```Javascript
assetFs.fetAssetAsBlob(assetPath)  // -> Promise [Blob]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Promise [Blob]`

**Throws:**

* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


### AssetFs#getAssetAsBlobUrl

Get the asset as a [BlobUrl][].

```Javascript
assetFs.fetAssetAsBlobUrl(assetPath)  // -> Promise [String]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Promise [String]`

**Throws:**

* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


### AssetFs#getAssetAsBuffer

Get the asset as a [Node.js Buffer][Buffer]. In the browser, Node.js Buffers
are [Uint8Array][] with augmented prototype ([more informations][buffer-browser]).

```Javascript
assetFs.fetAssetAsBlobUrl(assetPath)  // -> Promise [Buffer]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Promise [Buffer]`

**Throws:**

* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


### AssetFs#getAssetAsImage

Get the asset as an [Image][].

```Javascript
assetFs.fetAssetAsBlobUrl(assetPath)  // -> Promise [HTMLImageElement]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "image/foo/bar.png")

**Returns:**

* `Promise [HTMLImageElement]`

**Throws:**

* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


### AssetFs#getAssetAsText

Get the asset as a plain text.

```Javascript
assetFs.fetAssetAsText(assetPath)  // -> Promise [String]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "foo/hello.txt")

**Returns:**

* `Promise [String]`

**Throws:**

* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


### AssetFs#getAssetAsObject

Get the asset as a Javascript Object. This will only work if the asset is
a valid JSON.

```Javascript
assetFs.fetAssetAsText(assetPath)  // -> Promise [Object]
```

**Params:**

* `assetPath: String`: The asset path (e.g. "data/foo/bar.json")

**Returns:**

* `Promise [Object]`

**Throws:**

* `SyntaxError`: The asset is not a valid JSON.
* `UnreferencedAssetError`: The requested asset is not referenced by any index.
* `UnregisteredFragment`: The asset is referenced but the fragment that
  contains it is not referenced (this means that the given index contains
  errors).
* `MissingDataFetcher`: No data fetcher was registered.


[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[BlobUrl]: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
[Buffer]: https://nodejs.org/api/buffer.html
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[buffer-browser]: https://github.com/feross/buffer
[Image]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
