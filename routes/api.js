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
  	.get(  (req, res) => {
  		res.send(req.params.board)
  	})
  	.post( async (req, res) => {
  		const {text, delete_password} = req.body
  		var Thread = mongoose.model(req.params.board, threadSchema);
  		try {
  			await Thread.create({
	  			text,
	  			delete_password
  			});
  			res.send('thread created')
  		} 
  		catch {
  			res.send('could not create thread')
  		}
  		

  	})
    
  app.route('/api/replies/:board');

};
