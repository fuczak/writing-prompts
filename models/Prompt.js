var mongoose = require('mongoose');
var URLSlugs = require('mongoose-url-slugs');

var promptSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
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
            ref: 'User'
        },
        displayName: {
            type: String,
            required: true
        }
    },
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }],
    fans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fans',
        unique: true
    }],
    enemies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enemies',
        unique: true
    }],
    score: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true
    }
});

promptSchema.plugin(URLSlugs('prompt', {maxLength: 45}));

module.exports = mongoose.model('Prompt', promptSchema);