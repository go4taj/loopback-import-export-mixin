# loopback-import-export-mixin
Loopback mixin for bulk importing and exporting models  
#### Status
[![Build Status](https://travis-ci.org/go4taj/loopback-import-export-mixin.svg?branch=develop)](https://travis-ci.org/go4taj/loopback-import-export-mixin)
#### Installation:

```bash
npm install --save @tajahmed/loopback-import-export-mixin
```
#### Setup

##### SERVER CONFIG

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/@tajahmed/loopback-import-export-mixin",
      "../common/mixins"
    ]
  }
}
```

##### MODEL CONFIG

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "mixins": {
      "ImportExport" : true
    }
  }
```
![alt text](src/asset/explorer-export.png "Explorer demo")


##### LICENSE
[Apache License](./LICENSE)
