var mongoose = require('mongoose');

var storySchema = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	lastUpdated: {
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
	prompt: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Prompt',
			required: true
		},
		slug: {
			type: String,
			required: true
		}
	},
	fans: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	enemies: [{
		type: mongoose.Schema.Types.ObjectId,
		red: 'User'
	}],
	score: {
		type: Number,
		default: 0
	}
})

storySchema.pre('remove', function(next) {
	
})

module.exports = mongoose.model('Story', storySchema);