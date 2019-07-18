var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	text: {
		required: true,
		type: String
	},
	delete_password: {
		required: true,
		type: String
	},
	created_on: {
		required: true,
		type: Date,
		default: Date.now
	},
	bumped_on: {
		required: true,
		type: Date,
		default: Date.now
	},
	reported: {
		required: true,
		type: Boolean,
		default: false
	},
	replies: {
		type: Array,
		default: []
	}
})