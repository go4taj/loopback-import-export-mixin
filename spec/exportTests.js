var lbLib = require('../index');
var loopback = require("loopback");
var chai = require('chai');
var sinon = require('sinon');
var should = chai.should;
var assert = chai.assert;
var expect = chai.expect;
var test_data = require('./support/test_data');
var sinon_express = require('sinon-express-mock');

const app = loopback;
app.loopback = loopback;

lbLib(app);
const dataSource = app.createDataSource({ connector: app.Memory });

const Book = dataSource.createModel('Book',
  { id: { type: Number, generated: false, id: true }, name: String, author: String },
  { mixins: { ImportExport: true } }
);

before(async function() {
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

  describe("export method is called", function() {
    it("then it should get all model data in csv file", function(done) {
      var expectedCSV = '"name"\n"Do Androids Dream of Electric Sheep?"\n' +
        '"The Hitchhiker\'s Guide to the Galaxy (Hitchhiker\'s Guide to the Galaxy, #1)"\n' +
        '"Something Wicked This Way Comes (Green Town, #2)"\n"Pride and Prejudice and Zombies (Pride and Prejudice and Zombies, #1)"'
      var mockRes = sinon_express.mockRes({send:function(data){
          expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
          expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
          expect(data).to.be.equal(expectedCSV);
          done();
        }});
      Book.export({fields:['name']},mockRes,function(err,res){
        done(err);
      });
    });
  });
});
