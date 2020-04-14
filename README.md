# loopback-import-export-mixin
Loopback mixin for bulk importing and exporting models  
#### Status
[![Build Status](https://travis-ci.org/go4taj/loopback-import-export-mixin.svg?branch=master)](https://travis-ci.org/go4taj/loopback-import-export-mixin)
#### Installation:

```bash
npm install --save loopback-import-export-mixin
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
      "../node_modules/loopback-import-export-mixin/src",
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
      "ImportExport" : {"export": {}}
    }
  }
```

##### Modify/Format your headers and rows before you export

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "mixins": {
      "ImportExport": {
        "export": {
          "formatHeaders": "funcToFormatHeaders", // Optional
          "formatRow": "funcToFormatRecord" // Optional
        }
      }
    }
  }
```
Then defined the function implemenation in your <model>.js for Example to make all headers upper case. define the funciton as below

```javascript
    ModelName.funcToFormatHeaders = row=>row.map(r=>r.toUpperCase());
```

 
![alt text](src/asset/explorer-export.png "Explorer demo")

##### LICENSE
[Apache License](./LICENSE)
