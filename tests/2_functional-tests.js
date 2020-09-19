/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        let issue_data = {
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        }
       chai.request(server)
        .post('/api/issues/test')
        .send(issue_data)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.nestedInclude(res.body, issue_data)
          assert.isDefined(res.body.updated_on)
          assert.isDefined(res.body.created_on)
          assert.equal(res.body.updated_on,res.body.created_on,"Created and Updated Dates should match" )
          assert.isDefined(res.body.open)
          assert.deepEqual(res.body.open,true);
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        let issue_data = {
          issue_title: 'Title - Required',
          issue_text: 'text - Required',
          created_by: 'Functional Test - Required',
        }
        chai.request(server)
          .post('/api/issues/test')
          .send(issue_data)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.nestedInclude(res.body, issue_data)
            assert.isDefined(res.body.updated_on)
            assert.isDefined(res.body.created_on)
            assert.equal(res.body.updated_on,res.body.created_on,"Created and Updated Dates should match" )
            assert.isDefined(res.body.open)
            assert.deepEqual(res.body.open,true);
            done();
          });
      });
      
      test('Missing required fields', function(done) {
        let issue_data = {
          issue_title: 'Title'
        }
        chai.request(server)
          .post('/api/issues/test')
          .send(issue_data)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text,"required fields missing: issue_text,created_by")
            done();
          });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        
      });
      
      test('One field to update', function(done) {
        
      });
      
      test('Multiple fields to update', function(done) {
        
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        
      });
      
      test('Valid _id', function(done) {
        
      });
      
    });

});
