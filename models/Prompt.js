var mongoose = require('mongoose');

var promptSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    idea: {
        type: String,
        required: true,
        default: 'Not specified'
    },
    user: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'User'
    },
    votes: {
    	type: Number,
    	default: 0
    }
});

promptSchema.methods.upvote = function(cb) {
    this.votes += 1;
    this.save(cb);
};

promptSchema.methods.downvote = function(cb) {
    this.votes -+ 1;
    this.save(cb);
};

module.exports = mongoose.model('Prompt', promptSchema);