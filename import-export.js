const debug = require("debug");

module.exports = function (Model, options) {
  debug('ImportExport mixin for Model %s', Model.modelName);
  
  Model.export = function (filter, cb) {
    cb();
  };
  
  Model.remoteMethod('/export', {
    accepts: {arg: 'filter', type: 'object' ,description:"filter object for "+Model.modelName},
    returns: {arg: 'file', type: 'buffer', description:"exported file"}
  });
};