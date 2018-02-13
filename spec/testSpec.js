var lbLib = require('../index');
var loopback = require("loopback");
var chai = require('chai');
var should = chai.should;
var assert = chai.assert;
var test_data = require('./support/test_data');

const app = loopback;
app.loopback = loopback;

lbLib(app);
const dataSource = app.createDataSource({ connector: app.Memory });

const Book = dataSource.createModel('Book',
  { id: { type: Number, generated: false, id: true }, name: String, author: String },
  { mixins: { ImportExport: true } }
);

beforeEach(async function() {
  return Book.create(test_data.books,function (err, books) {
    console.log("Books "+(err?"not inserted":"inserted"));
  });
});

describe("when import-export mixin", function() {
  
  describe("is defined in model definition ", function() {
    it("then it should have import method defined", function() {
      assert.isFunction(Book.export,"Export function should be defined in book model");
    });
  });
});
