const debug = require("debug");
const json2csv = require("json2csv");

var validatedFunction = (func)=>{
  return typeof func==='function'?func:(a)=>a;
};

module.exports = function (Model, options) {
  debug('ImportExport mixin for Model %s', Model.modelName);

  if (options.export){
    Model.export = function (filter, res, cb) {
      res.set('Content-disposition', 'attachment; filename='+Model.modelName+'.csv');
      res.set('Content-Type', 'text/csv');
      if(!filter) filter = {};
      var fields = filter.fields?filter.fields:Object.keys(Model.definition.properties);
      let fieldsIsObject = (filter.fields instanceof Object) && !(filter.fields instanceof Array);
      if(fieldsIsObject){
        fields = Object.keys(filter.fields).filter(function (value) {
          return filter.fields[value];
        });
        //Reset to all if no fields defined in object
        if(!fields.length) fields = Object.keys(Model.definition.properties);
      } else {
        filter.fields = fields;
      }
      try {
        Model.find(filter,function (err,values) {
          if(typeof options.export === 'object'){
            if(options.export.formatRow){
              values = values.map(validatedFunction(Model[options.export.formatRow]));
            }
            if(options.export.formatHeaders){
              var newFields = validatedFunction(Model[options.export.formatHeaders])(fields);
              values = values.map(val=>{
                fields.forEach((field,i)=>{
                  val[newFields[i]] = val[fields[i]]
                });
                return val;
              });
              fields = newFields;
            }
          }
          var csv = json2csv({ data:values , fields: fields});
          res.send(csv);
        });
      } catch (err) {
        debug("[parse]["+Model.modelName+"] err: ",err);
        cb("Could not parse csv");
      }
    };

    var exportOptions = {
      accepts: [
        {arg: 'filter', type: 'object' ,description:"filter object for "+Model.modelName},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      returns: [],
      http:{verb:"get",path:"/export"},
      description:"Export model data in csv / xls file"
    };
    Object.keys(Model.definition.properties).forEach(property=>{
      exportOptions.returns.push({arg:property,type:Model.definition.properties[property].type,description:Model.definition.properties[property].description})
    });
    Model.remoteMethod('export', exportOptions);
  }

};