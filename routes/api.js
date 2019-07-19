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
  		try {
  			const threads = await Board.find({}, 
  			'text replies',
  			{
  				sort: {bumped_on: -1}, 
  				limit: 10
  			} 		
  			)
	  		threads.forEach( thread => {
	  			thread.replies.splice(0, thread.replies.length - 3);
	  		})
	  		res.json(threads)
  		} catch (err) {
  			console.error(err);
  		}
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
  	.put ( async (req, res) => {
  		var Board = mongoose.model(req.params.board, threadSchema);
  		try {
  			let thread = await Board.findById(req.body.thread_id); 			
  			//report a thread
  				thread.reported = true;
  				await thread.save();
  				return res.send('thread reported')
  		} catch (err) {
  			console.error(err);
  			res.send('error reporting this post')
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
  	});
    
  app.route('/api/replies/:board')
  	.get (async (req, res) => {
  		let Board = mongoose.model(req.params.board, threadSchema);
  		try {
  			const thread = await Board.findById(req.query.thread_id, 'text replies');
  			res.json(thread)
  		} catch (err) {
  			console.error(err);
  		}
  	})
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
  	.put( async (req, res) => {
  		let Board = mongoose.model(req.params.board, threadSchema);
  		if (!req.body.thread_id || !req.body.reply_id) {
  			return res.send('Please provide a reply to report')
  		}
  		try {
  			let thread = await Board.findById(req.body.thread_id);
  			 //report a reply 
			thread.replies.forEach(async reply => {
				if(reply._id === req.body.reply_id) {
				reply.reported = true
				thread.markModified('replies');
				await thread.save();
				return res.send('reply reported');
				}
			})
		} catch (err) {
			console.error(err)
			res.send('We are having some trouble reporting this reply!')
		}
	})
	.delete(async (req, res) => {
		let Board = mongoose.model(req.params.board, threadSchema);
		try {
			let thread = await Board.findOne({_id: req.body.thread_id});
			thread.replies.forEach(async reply => {
				if(reply._id === req.body.reply_id) {
					if (req.body.delete_password !== reply.delete_password) {
						return res.send('incorrect password')
					} else {
						reply.text = '[deleted]';
						thread.markModified('replies');
						await thread.save();
						res.send('success')
					}
				}
			});
		} catch (err) {
			console.error(err);
			res.send('error trying to delete reply!')
		}
	})
};
