var import_export_mixin = require("./src/import-export");

module.exports =  function(app){
  app.loopback.modelBuilder.mixins.define('ImportExport', import_export_mixin);
};

