var mongoose = require('mongoose');
var async = require('async');
var User = require('./User');
var Prompt = require('./Prompt');

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

// Removing all story db entries
storySchema.pre('remove', function(next) {
    var story = this;
    async.waterfall([

        function(callback) {
            Prompt.findById(story.prompt, function(err, prompt) {
                prompt.stories.pull(story)
                prompt.save()
            })
            callback(null, story)
        },
        function(story, callback) {
            story.fans.forEach(function(fan) {
                User.findById(fan, function(err, user) {
                    user.likedStories.pull(story)
                    user.save()
                })
            })
            callback(null, 'Done')
        }
    ])
    next();
})

module.exports = mongoose.model('Story', storySchema);