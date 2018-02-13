const debug = require("debug");
const json2csv = require("json2csv");

module.exports = function (Model, options) {
  debug('ImportExport mixin for Model %s', Model.modelName);
  
  Model.export = function (filter, res, cb) {
    res.set('Content-disposition', 'attachment; filename='+Model.modelName+'.csv');
    res.set('Content-Type', 'text/csv');
    var fields = filter.fields || Object.keys(Model.definition.properties);
    try {
      Model.find(filter,function (err,values) {
        var jsonValues = values.map(function (err, value) {
          var obj = {};
          Object.keys(fields).forEach(function (field) {
            obj[field] = value[field];
          });
          return obj;
        });
        var csv = json2csv({ data:values , fields: fields});
        res.send(csv);
      });
    } catch (err) {
      debug("[parse]["+Model.modelName+"] err: ",err);
      cb("Could not parse csv");
    }
  };
  
  Model.remoteMethod('export', {
    accepts: [
      {arg: 'filter', type: 'object' ,description:"filter object for "+Model.modelName},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
    returns: {arg: 'file', type: 'buffer', description:"exported file"},
    http:{verb:"get",path:"/export"},
    description:"Export model data in csv / xls file"
  });
};