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

before(function() {
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

  describe("export method is called on book model", function() {
    it("then it should get all model book names in csv file", function(done) {
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

  describe("export method is called on book model without fields argument", function() {
    it("then it should get all model data in csv file", function(done) {
      var expectedCSV = '"id","name","author"\n' +
        '1,"Do Androids Dream of Electric Sheep?","Philip K. Dick"\n' +
        '2,"The Hitchhiker\'s Guide to the Galaxy (Hitchhiker\'s Guide to the Galaxy, #1)","Douglas Adams "\n' +
        '3,"Something Wicked This Way Comes (Green Town, #2)","Ray Bradbury "\n' +
        '4,"Pride and Prejudice and Zombies (Pride and Prejudice and Zombies, #1)","Seth Grahame-Smith"';
      var mockRes = sinon_express.mockRes({send:function(data){
          expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
          expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
          expect(data).to.be.equal(expectedCSV);
          done();
        }});
      Book.export({},mockRes,function(err,res){
        done(err);
      });
    });
  });
  describe("export method is called on book model field arguments having no fields", function() {
    it("then it should get empty model data in csv file", function(done) {
      var expectedCSV = '';
      var mockRes = sinon_express.mockRes({send:function(data){
          expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
          expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
          expect(data).to.be.equal(expectedCSV);
          done();
        }});
      Book.export({fields:[]},mockRes,function(err,res){
        done(err);
      });
    });
  });
  describe("export method is called on book model with fields argument not as Array", function() {
    it("then it should reset to get all model book names in csv file", function(done) {
      var expectedCSV = '"id","name","author"\n' +
        '1,"Do Androids Dream of Electric Sheep?","Philip K. Dick"\n' +
        '2,"The Hitchhiker\'s Guide to the Galaxy (Hitchhiker\'s Guide to the Galaxy, #1)","Douglas Adams "\n' +
        '3,"Something Wicked This Way Comes (Green Town, #2)","Ray Bradbury "\n' +
        '4,"Pride and Prejudice and Zombies (Pride and Prejudice and Zombies, #1)","Seth Grahame-Smith"';
      var mockRes = sinon_express.mockRes({send:function(data){
          expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
          expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
          expect(data).to.be.equal(expectedCSV);
          done();
        }});
      Book.export({fields:{}},mockRes,function(err,res){
        done(err);
      });
    });
  });
  describe("export method is called on book model with fields argument as Object with id,author fields only", function() {
    it("then it should get only id,author fields data in csv file", function(done) {
      var expectedCSV = '"id","author"\n1,"Philip K. Dick"\n2,"Douglas Adams "\n3,"Ray Bradbury "\n4,"Seth Grahame-Smith"';
      var mockRes = sinon_express.mockRes({send:function(data){
          expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
          expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
          expect(data).to.be.equal(expectedCSV);
          done();
        }});
      Book.export({fields:{id:true,author:true}},mockRes,function(err,res){
        done(err);
      });
    });
  });

  describe("export method is called on book model with fields argument as Object", function() {
    describe("and object is defined with false fields value",function () {
      it("then it should get fields with only true values", function(done) {
        var expectedCSV = '"id","author"\n1,"Philip K. Dick"\n2,"Douglas Adams "\n3,"Ray Bradbury "\n4,"Seth Grahame-Smith"';
        var mockRes = sinon_express.mockRes({send:function(data){
            expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
            expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
            expect(data).to.be.equal(expectedCSV);
            done();
          }});
        Book.export({fields:{id:true,name:false,author:true}},mockRes,function(err,res){
          done(err);
        });
      });
    });
  });
});
