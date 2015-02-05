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
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }]
});

promptSchema.methods.upvote = function(cb) {
    this.votes += 1;
    this.save(cb);
};

promptSchema.methods.downvote = function(cb) {
    this.votes -= 1;
    this.save(cb);
};

module.exports = mongoose.model('Prompt', promptSchema);