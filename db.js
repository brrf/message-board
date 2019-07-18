var mongoose = require('mongoose');


module.exports = function () {
	mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
	  console.log('connected to mongoDB!')
	});
}