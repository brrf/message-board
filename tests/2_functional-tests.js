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

const mongoose = require('mongoose');
const threadSchema = require('../schemas/thread');
let testBoard = mongoose.model('testBoard', threadSchema);


suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('post new thread', function(done) {
       chai.request(server)
        .post('/api/threads/testBoard')
        .send({
            text: 'new thread',
            delete_password: 'password'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'thread created');    
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get recent threads', function(done) {
       chai.request(server)
        .get('/api/threads/:board')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response is an array of recent threads');
          assert.isBelow(res.body.length, 11, 'max 10 threads');
          assert.isBelow(res.body[0].replies, 3, 'max three replies per thread')
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'delete_password'); 
          done();
        });
      });
    });
    
    suite('DELETE', function() {
        test('delete a thread', function(done) {
            let testThread = new testBoard({
                text: 'Test board for deletion',
                delete_password: 'correctpassword'
            })
            testThread.save();
       chai.request(server)
        .delete('/api/threads/testboard')
        .send({
            thread_id: testThread._id,
            delete_password: testThread.delete_password
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'thread deleted'); 
          done();
        });
      });     
    });
    
    suite('PUT', function() {
      test('report a thread', async function() {
            let testThread = new testBoard({
                text: 'Test board for deletion',
                delete_password: 'correctpassword'
            })
            await testThread.save();
       chai.request(server)
        .put('/api/threads/testboard')
        .send({
            thread_id: testThread._id,
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'thread reported'); 
        });
      });   
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('post new thread', async function() {
         let testThread = new testBoard({
                text: 'Test board for deletion',
                delete_password: 'correctpassword'
            })
        await testThread.save()
       chai.request(server)
        .post('/api/replies/testboard')
        .send({
            text: 'new reply',
            delete_password: 'password',
            thread_id: testThread._id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reply posted');   
        });
      });
    });
    
    suite('GET', function() {
      test('get recent replies', async function() {
        let testThread = new testBoard({
                text: 'Test board for deletion',
                delete_password: 'correctpassword'
            })
        testThread.replies.push({
            _id: 12345,
            created_on: new Date(),
            delete_password: 'testpassword',
            reported: false,
            text: 'test text'
        })
        testThread.markModified('replies');
        await testThread.save();
       chai.request(server)
        .get(`/api/replies/testboard?thread_id=${testThread._id}`)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies, 'response.replies is an array of all replies');
          assert.notProperty(res.body.replies[0], 'reported');
          assert.notProperty(res.body.replies[0], 'delete_password'); 
        });
      });
    });
    
    suite('PUT', function() {
      test('report a reply', async function() {
        let testThread = new testBoard({
            text: 'Test board for deletion',
            delete_password: 'correctpassword'
        })
        testThread.replies.push({
            _id: 12345,
            created_on: new Date(),
            delete_password: 'testpassword',
            reported: false,
            text: 'test text'
        })
        testThread.markModified('replies');
        await testThread.save();
       chai.request(server)
        .put('/api/replies/testboard')
        .send({
            thread_id: testThread._id,
            reply_id: 12345
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reply reported'); 
        });
      });
    });
    
    suite('DELETE', function() {
     test('delete a reply', async function() {
        let testThread = new testBoard({
            text: 'Test board for deletion',
            delete_password: 'correctpassword'
        })
        testThread.replies.push({
            _id: 12345,
            created_on: new Date(),
            delete_password: 'testpassword',
            reported: false,
            text: 'test text'
        })
        testThread.markModified('replies');
        await testThread.save();
       chai.request(server)
        .delete('/api/replies/testboard')
        .send({
            thread_id: testThread._id,
            reply_id: 12345,
            delete_password: 'testpassword'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success'); 
        });
      });   
    });
    
  });

});
