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
          issue_text: 'Functional Test - Every field filled in',
          created_by: 'Bob',
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
        chai.request(server)
          .put('/api/issues/test')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text,"_id error")
            done();
          });
      });

      test('Bad _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({'_id': '5f665eb46e296f6b9b6a504d', 'issue_text': "blah"})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text,"could not update 5f665eb46e296f6b9b6a504d")
            done();
          });
      });
      
      test('One field to update', function(done) {
        const new_issue = {
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'This Will be Changed',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        }
        let issue_change = {
          _id: "",
          created_by: "a new user"
        }
        chai.request(server)
          .post('/api/issues/test')
          .send(new_issue)
          .end(function(err, res){
            assert.equal(res.status, 200);
            issue_change._id = res.body._id;

            chai.request(server)
              .put('/api/issues/test')
              .send(issue_change)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "successfully updated")

                chai.request(server)
                  .get('/api/issues/test?_id=' + issue_change._id)
                  .send(issue_change)
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body)
                    assert.equal(res.body[0].created_by, "a new user");
                    done();
                  });
              });
          });
      });
      
      test('Multiple fields to update', function(done) {
        const new_issue = {
          issue_title: 'Multiple Field Update',
          issue_text: 'This Will be Changed',
          created_by: 'Joe',
          assigned_to: 'Dave',
          status_text: 'In QA'
        }
        let issue_change = {
          _id: "",
          issue_text: "a new user",
          assigned_to: "Judy",
          status_text: "Ship it!"
        }
        chai.request(server)
          .post('/api/issues/test')
          .send(new_issue)
          .end(function(err, res){
            assert.equal(res.status, 200);
            issue_change._id = res.body._id;

            chai.request(server)
              .put('/api/issues/test')
              .send(issue_change)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "successfully updated")

                chai.request(server)
                  .get('/api/issues/test?_id=' + issue_change._id)
                  .send(issue_change)
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body)
                    assert.nestedInclude(res.body[0], issue_change);
                    done();
                  });
              });
          });
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
        // Create a unique project name for filtering
        const url = "/api/issues/filter_test_" + Date.now().toString().substring(7);
        let item_template = {
          issue_title: 'Single Field Filter',
          issue_text: 'One is the loneliest number',
          created_by: ''
        }

        // Add items to the project
        let a = chai.request(server)
          .post(url)
          .send(Object.assign(item_template, { 'created_by': 'Alfie' }))
        let b =  chai.request(server)
          .post(url)
          .send(Object.assign(item_template, { 'created_by': 'Bruce' }))
        let c = chai.request(server)
          .post(url)
          .send(Object.assign(item_template, { 'created_by': 'Charlie' }))

        // Once added filter down
        Promise.all([a,b,c])
          .then(() => {
            chai.request(server)
              .get(url + '?created_by=Bruce')
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.lengthOf(res.body,1);
                assert.equal(res.body[0].created_by,'Bruce');
                done();
              });
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        // Create a unique project name for filtering
        const url = "/api/issues/filter_test_" + Date.now().toString().substring(7);
        let item_template = {
          issue_title: 'Multiple Field Filter',
          issue_text: 'Two can make it better',
          created_by: '',
          assigned_to: '',
        }

        // Add items to the project
        let a = chai.request(server)
          .post(url)
          .send(Object.assign(item_template, {
            'created_by': 'Bruce',
            'assigned_to': 'Dave'
          }))
        let b =  chai.request(server)
          .post(url)
          .send(Object.assign(item_template, {
            'created_by': 'Bruce',
            'assigned_to': 'Dave'
          }))
        let c = chai.request(server)
          .post(url)
          .send(Object.assign(item_template, {
            'created_by': 'Charlie',
            'assigned_to': 'Dave'
          }))
        let d = chai.request(server)
          .post(url)
          .send(Object.assign(item_template, {
            'created_by': 'Charlie',
            'assigned_to': 'Dave'
          }))

        // Once added filter down
        Promise.all([a,b,c,d])
          .then(() => {
            chai.request(server)
              .get(url + '?created_by=Bruce&assigned_to=Dave')
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.lengthOf(res.body,2);
                assert.equal(res.body[0].created_by,'Bruce');
                assert.equal(res.body[0].assigned_to,'Dave');
                assert.equal(res.body[1].created_by,'Bruce');
                assert.equal(res.body[1].assigned_to,'Dave');
                done();
              });
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "_id error")
            done();
          })
      });

      test('Invalid _id', function(done) {
        const data = { '_id': '5f665eb46e296f6b9b6a504d' }
        chai.request(server)
          .delete('/api/issues/test')
          .send(data) // Fake Id
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "could not delete " + data._id)
            done();
          })
      });
      
      test('Valid _id', function(done) {
        let issue_data = {
          issue_title: 'Delete Me!',
          issue_text: 'This is a sample issue to be deleted',
          created_by: 'Bob',
        }
        chai.request(server)
          .post('/api/issues/test')
          .send(issue_data)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            issue_data['_id'] = res.body._id;
            chai.request(server)
              .delete('/api/issues/test')
              .send({ _id: issue_data._id } )
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, "deleted " + issue_data._id)
                done();
              })

          });
      });
    });
});
