/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const threadSchema = require('../schemas/thread');
var mongoose = require('mongoose');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  	.get(  async (req, res) => {
  		var Board = mongoose.model(req.params.board, threadSchema);
  		const threads = await Board.find({}, 
  			'text replies',
  			{
  				sort: {bumped_on: -1}, 
  				limit: 2
  			}
  		)
  		res.json(threads)
  	})
  	.post( async (req, res) => {
  		const {text, delete_password} = req.body
  		var Board = mongoose.model(req.params.board, threadSchema);
  		try {
  			await Board.create({
	  			text,
	  			delete_password
  			});
  			res.send('thread created')
  		} catch {
  			res.send('could not create thread')
  		}
  		

  	})
  	.delete ( async (req, res) => {
  		var Board = mongoose.model(req.params.board, threadSchema);
  		try {
  			const thread = await Board.findOne({_id: req.body.thread_id});
  			if (!thread) {
  				return res.send('no thread exists');
  			} else if (req.body.delete_password !== thread.delete_password) {
  				return res.send('incorrect password');
  			} else {
  				await Board.findByIdAndDelete(thread._id)
  				res.send('thread deleted')
  			}

  		} catch (err) {
  			console.error(err);
  			res.status(500).json('Error in database')
  		}
  		

  	})
    
  app.route('/api/replies/:board')
  	.post( async (req, res) => {
  		const {text, delete_password, thread_id} = req.body;

  		const ID = function () {
  			return '_' + Math.random().toString(36).substr(2, 9);
		};

  		const reply = {
  			_id: ID(),
  			created_on: new Date(),
  			delete_password,
  			reported: false,
  			text
  		}
  		var Board = mongoose.model(req.params.board, threadSchema);
  		try {
  			await Board.findByIdAndUpdate(thread_id, {
  				"$push": {replies: reply},
  				"$set": {bumped_on: new Date()}
  			});
  			res.send('reply posted')
  		} catch (err) {
  			console.error(err);
  			res.status(500).json('error posting reply')
  		}
  	})

};
