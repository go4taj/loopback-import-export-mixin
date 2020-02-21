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
  { mixins: { ImportExport: {export:true} } }
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
      var methods = Book.sharedClass._methods;
      var exportMethod = methods.find(m=>m.name=="export");
      var returnFields = exportMethod.returns.map(m=>m.arg);
      assert.deepEqual(returnFields,["id","name","author"]);
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

      it("then it should get fields supplied in filter with fields array", function(done) {
          var expectedCSV = '"id","author"\n1,"Philip K. Dick"\n2,"Douglas Adams "\n3,"Ray Bradbury "\n4,"Seth Grahame-Smith"';
          var mockRes = sinon_express.mockRes({send:function(data){
                  expect(mockRes.set.calledWithExactly("Content-disposition",'attachment; filename=Book.csv')).to.be.true;
                  expect(mockRes.set.calledWithExactly("Content-Type",'text/csv')).to.be.true;
                  expect(data).to.be.equal(expectedCSV);
                  done();
              }});
          Book.export({fields:["id","author"]},mockRes,function(err,res){
              done(err);
          });
      });
    });
  });

  describe("export method is called on book model with with formatRow option defined", function() {
    const Book = dataSource.createModel('Book',
      { id: { type: Number, generated: false, id: true }, name: String, author: String },
      { mixins: { ImportExport: {export:{formatRow:"formatAuthor"}} } }
    );

    Book.formatAuthor = row=>{
      row.author = row.author.toUpperCase();
      return row;
    };
    describe("to make author uppercase",()=>{
      it("then it should show rows with author column in upper case", function(done) {
        var expectedCSV = '"id","author"\n1,"PHILIP K. DICK"\n2,"DOUGLAS ADAMS "\n3,"RAY BRADBURY "\n4,"SETH GRAHAME-SMITH"';
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
    describe("with empty object",()=>{
      const Book = dataSource.createModel('Book',
        { id: { type: Number, generated: false, id: true }, name: String, author: String },
        { mixins: { ImportExport: {export:{}} } }
      );
      it("then it should not make any changes to ouput records", function(done) {
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

    describe(" as true",()=>{
      const Book = dataSource.createModel('Book',
        { id: { type: Number, generated: false, id: true }, name: String, author: String },
        { mixins: { ImportExport: {export:true} } }
      );
      it("then it should not make any changes to ouput records", function(done) {
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

    describe("and Model has not defined the function",()=>{
      before(()=>{
        Book.formatAuthor = undefined;
      });
      after(()=>{
        Book.formatAuthor = row=>{
          row.author = row.author.toUpperCase();
          return row;
        };
      });
      it("then it should not make any changes to ouput records", function(done) {
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
  });

  describe("export method is called on book model with with formatHeaders option defined", function() {
    const Book = dataSource.createModel('Book',
      { id: { type: Number, generated: false, id: true }, name: String, author: String },
      { mixins: { ImportExport: {export:{formatHeaders:"formatHeaders"}} } }
    );

    Book.formatHeaders = row=>row.map(r=>r.toUpperCase());

    describe("to make headers uppercase",()=>{
      it("then it should show rows with author column in upper case", function(done) {
        var expectedCSV = '"ID","AUTHOR"\n1,"Philip K. Dick"\n2,"Douglas Adams "\n3,"Ray Bradbury "\n4,"Seth Grahame-Smith"';
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
    describe("with empty object",()=>{
      const Book = dataSource.createModel('Book',
        { id: { type: Number, generated: false, id: true }, name: String, author: String },
        { mixins: { ImportExport: {export:{}} } }
      );
      it("then it should not make any changes to ouput records", function(done) {
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

    describe(" as true",()=>{
      const Book = dataSource.createModel('Book',
        { id: { type: Number, generated: false, id: true }, name: String, author: String },
        { mixins: { ImportExport: {export:true} } }
      );
      it("then it should not make any changes to ouput records", function(done) {
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

    describe("and Model has not defined the function",()=>{
      before(()=>{
        Book.formatHeaders = undefined;
      });
      after(()=> {
        Book.formatHeaders = row => row.map(r => r.toUpperCase());
      });

      it("then it should not make any changes to ouput records", function(done) {
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
  });

});
