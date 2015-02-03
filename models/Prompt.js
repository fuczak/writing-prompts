var mongoose = require('mongoose');

var promptSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    prompt: {
        type: String,
        required: true
    },
    user: {
    	type: mongooseSchema.ObjectId,
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

mongoose.model('Prompt', promptSchema);