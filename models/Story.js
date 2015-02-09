var mongoose = require('mongoose');

var storySchema = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	story: {
		type: String,
		required: true
	},
	user: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', 
			required: true
		},
		displayName: {
			type: String,
			required: true
		}
	},
	votes: {
		type: Number,
		default: 0
	},
	prompt: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Prompt',
		required: true
	},
	fans: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Fans'
	}],
	enemies: [{
		type: mongoose.Schema.Types.ObjectId,
		red: 'Enemies'
	}],
	score: {
		type: Number,
		default: 0
	}
})

// storySchema.methods.upvote = function(cb) {
// 	this.votes += 1;
// 	this.save(cb);
// };

// storySchema.methods.downvote = function(cb) {
// 	this.votes -= 1;
// 	this.save(cb);
// };

module.exports = mongoose.model('Story', storySchema);