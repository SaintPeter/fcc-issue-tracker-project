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

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;

      console.log('/api/issues/' + project);
      IssueModel.find({ project: project }, (err, docs) => {
        console.log("Docs Found: ",docs.length)
        return res.json(docs);
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;

      console.log("Post to Project: " + project);
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
        console.log("Saved");
        if(err) { console.log(err) }
        console.log("Doc Written:",result.toJSON);
        res.json(result.toJSON());
      })

    })
    
    .put(function (req, res){
      var project = req.params.project;
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
    });
    
};
