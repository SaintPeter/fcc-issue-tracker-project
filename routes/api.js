/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var IssueModel = require('../models/issue').IssueModel;

const mongoose = require('mongoose');
const connection = mongoose.connect('mongodb://localhost:27017/issue_tracker', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useCreateIndex', true);


const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const updatable_fields = [
  "issue_title",
  "issue_text",
  "created_by",
  "assigned_to",
  "status_text",
  "open"
]

const field_list = updatable_fields.concat([
  "_id",
  "created_on",
  "updated_on"
]);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      var project = req.params.project;

      // Build Query
      let query = { project: project };  // We always filter by project
      field_list.forEach(field => {
        if(req.query.hasOwnProperty(field)) {
          query[field] = req.query[field];
        }
      })

      IssueModel.find(query, (err, docs) => {
        return res.json(docs);
      })
    })

    .post(function (req, res){
      let project = req.params.project;

      // check required fields
      let missing_fields = ['issue_title', 'issue_text', 'created_by']
        .filter( field => !req.body.hasOwnProperty(field))
        .join(',');

      if(missing_fields) {
        return res.send("required fields missing: " + missing_fields);
      }

      // Otherwise, create the object
      let issue = new IssueModel({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to  || '',
        status_text: req.body.status_text || ''
      });

      issue.save(function(err, result) {
        if(err) { console.log(err) }
        res.json(result.toJSON());
      })

    })

    .put(function (req, res){
      let project = req.params.project;
      let id = req.body._id;

      // No id passed
      if(!id) {
        return res.send('_id error')
      }

      // Build update object
      let update = {};
      let count = 0;
      updatable_fields.forEach(field => {
        if(req.body.hasOwnProperty(field)) {
          update[field] = req.body[field];
          count++;
        }
      })

      if(!count) {
        return res.send('no updated field sent')
      }

      IssueModel.updateOne({ project, _id: id }, update, (err, result) => {
        if(err) console.log(err);

        // id not found
        if(result.nModified === 0 || result.n === 0) {
          return res.send('could not update ' + id);
        }

        // Success!
        res.send('successfully updated')
      });
    })

    .delete(function (req, res){
      let project = req.params.project;
      let id = req.body._id;

      // No id passed
      if(!id) {
        return res.send('_id error')
      }

      IssueModel.deleteOne({ project, '_id': id })
        .then(result => {
          if(result.deletedCount === 1) {
            return res.send('deleted ' + id);
          } else {
            return res.send('could not delete ' + id);
          }
        });
    });

}
