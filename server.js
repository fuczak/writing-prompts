var path = require('path');
var qs = require('querystring');
var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');
var decay = require('decay');
var hotScore = decay.redditHot();
var wilsonScore = decay.wilsonScore();
var async = require('async');
var User = require('./models/User');
var Prompt = require('./models/Prompt');
var Story = require('./models/Story');
// config file
var config = require('./config');

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
    app.use(function(req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
}
app.use(express.static(path.join(__dirname, 'public')));

setInterval(function() {
    Prompt.find(function(err, prompts) {
        if (err) return console.log(err)
        async.waterfall([
            function(callback) {
                var candidates = [];
                for(i=0; i<prompts.length; i++) {
                    candidates.push(prompts[i]);
                };
                callback(null, candidates);
            },
            function(candidates, callback) {
                candidates.forEach(function(c) {
                    c.score = hotScore(c.fans.length, c.enemies.length, c.created)
                    Prompt.findById(c._id, function(err, prompt) {
                        if (err) return console.log(err);
                        prompt.score = c.score;
                        prompt.save(function() {
                            console.log('Prompt ' + prompt._id + ' saved with score: ' + c.score);
                        });
                    });
                });
                callback(null, 'done')
            },
        ], function(err, results) {
            console.log(results)
        })
    });
}, 1000 * 60 * 5);

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({
            message: 'Please make sure your request has an Authorization header'
        });
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, config.TOKEN_SECRET);
    if (payload.exp <= moment().unix()) {
        return res.status(401).send({
            message: 'Token has expired'
        });
    }
    req.user = payload.sub;
    next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
        if (!user) {
            return res.status(400).send({
                message: 'User not found'
            });
        }
        user.displayName = req.body.displayName || user.displayName;
        user.email = req.body.email || user.email;
        user.save(function(err) {
            if (err) return res.status(409).send({
                message: 'Username and/or Email are already taken'
            });
            res.status(200).end();
        });
    });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, res) {
    User.findOne({
        email: req.body.email
    }, '+password', function(err, user) {
        if (!user) {
            return res.status(401).send({
                message: 'Wrong email and/or password'
            });
        }
        user.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({
                    message: 'Wrong email and/or password'
                });
            }
            res.send({
                token: createToken(user)
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function(req, res) {
    User.findOne({
        email: req.body.email
    }, function(err, existingUser) {
        if (existingUser) {
            return res.status(409).send({
                message: 'Email is already taken'
            });
        };
        User.findOne({
            displayName: req.body.displayName
        }, function(err, existingUser) {
            if (existingUser) {
                return res.status(409).send({
                    message: 'Username is already taken'
                });
            };
            var user = new User({
                displayName: req.body.displayName,
                email: req.body.email,
                password: req.body.password
            });
            user.save(function() {
                res.send({
                    token: createToken(user)
                });
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create a new Prompt
 |--------------------------------------------------------------------------
 */

app.post('/api/prompt', ensureAuthenticated, function(req, res) {
    var prompt = new Prompt({
        prompt: req.body.prompt,
        user: {
            _id: req.body.user._id,
            displayName: req.body.user.displayName
        }
    });
    prompt.save(function() {
        User.findById(prompt.user, function(err, user) {
            user.prompts.push(prompt);
            user.save(function() {
                res.send(prompt);
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Get all Prompts
 |--------------------------------------------------------------------------
 */

app.get('/api/prompts', function(req, res) {
    Prompt.find(function(err, prompts) {
        if (err) {
            res.status(409).send(res.body)
        }
        res.send(prompts);
    })
});

/*
 |--------------------------------------------------------------------------
 | Get a specific Prompt
 |--------------------------------------------------------------------------
 */

app.get('/api/prompts/:id', function(req, res) {
    Prompt.findById(req.params.id, function(err, prompt) {
        if (err) {
            res.status(409).send(res.body)
        }

    }).populate('stories').exec(function(err, prompt) {
        if (err) {
            res.status(409).send(res.body)
        }
        res.send(prompt);
    });
});

/*
 |--------------------------------------------------------------------------
 | Post a story
 |--------------------------------------------------------------------------
 */

app.post('/api/prompts/:id/stories', ensureAuthenticated, function(req, res) {
    var story = new Story({
        story: req.body.story,
        user: {
            _id: req.body.user._id,
            displayName: req.body.user.displayName
        },
        prompt: req.params.id,
        fans: req.body.user._id
    });
    console.log(story);
    story.save(function(err, story) {
        if (err) {
            res.status(409).send(res.body)
        }
        Prompt.findById(req.params.id, function(err, prompt) {
            if (err) {
                res.status(409).send(res.body)
            }
            prompt.stories.push(story);
            prompt.save(function(err, prompt) {
                if (err) {
                    res.status(409).send(res.body)
                }
                User.findById(story.user, function(err, user) {
                    if (err) {
                        res.status(409).send(res.body)
                    }
                    user.stories.push(story);
                    user.save(function() {
                        res.send(story);
                    });
                });
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Upvoting prompt
 |--------------------------------------------------------------------------
 */

app.post('/api/prompts/:id/upvote', ensureAuthenticated, function(req, res) {
    Prompt.findById(req.params.id, function(err, prompt) {
        if (err) {
            res.status(409).send(res, body);
        }
        var fanIndex = prompt.fans.indexOf(req.body._id);
        var isFan = fanIndex == -1 ? false : true;
        var enemyIndex = prompt.enemies.indexOf(req.body._id);
        var isEnemy = enemyIndex == -1 ? false : true;
        if (isFan) {
            prompt.fans.splice(fanIndex, 1);
        } else {
            if (isEnemy) {
                prompt.enemies.splice(enemyIndex, 1);
            }
            prompt.fans.addToSet(req.body._id);
        }
        prompt.save(function() {
            res.send({
                fans: prompt.fans,
                enemies: prompt.enemies
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Downvoting prompt
 |--------------------------------------------------------------------------
 */

app.post('/api/prompts/:id/downvote', ensureAuthenticated, function(req, res) {
    Prompt.findById(req.params.id, function(err, prompt) {
        if (err) {
            res.status(409).send(res, body);
        }
        var fanIndex = prompt.fans.indexOf(req.body._id);
        var isFan = fanIndex == -1 ? false : true;
        var enemyIndex = prompt.enemies.indexOf(req.body._id);
        var isEnemy = enemyIndex == -1 ? false : true;
        if (isEnemy) {
            prompt.enemies.splice(enemyIndex, 1);
        } else {
            if (isFan) {
                prompt.fans.splice(fanIndex, 1);
            }
            prompt.enemies.addToSet(req.body._id);
        }
        prompt.save(function() {
            res.send({
                fans: prompt.fans,
                enemies: prompt.enemies
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Upvoting story
 |--------------------------------------------------------------------------
 */

app.post('/api/stories/:id/upvote', ensureAuthenticated, function(req, res) {
    Story.findById(req.params.id, function(err, story) {
        if (err) {
            res.status(409).send(res, body);
        }
        var fanIndex = story.fans.indexOf(req.body._id);
        var isFan = fanIndex == -1 ? false : true;
        var enemyIndex = story.enemies.indexOf(req.body._id);
        var isEnemy = enemyIndex == -1 ? false : true;
        if (isFan) {
            story.fans.splice(fanIndex, 1);
        } else {
            if (isEnemy) {
                story.enemies.splice(enemyIndex, 1);
            }
            story.fans.addToSet(req.body._id);            
        }
        story.score = wilsonScore(story.fans.length, story.enemies.length, story.created);
        console.log('Upvoting story' + story._id + ' with score: ' + story.score)
        story.save(function() {
            res.send({
                fans: story.fans,
                enemies: story.enemies,
                score: story.score
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Downvoting story
 |--------------------------------------------------------------------------
 */

app.post('/api/stories/:id/downvote', ensureAuthenticated, function(req, res) {
    Story.findById(req.params.id, function(err, story) {
        if (err) {
            res.status(409).send(res, body);
        }
        var fanIndex = story.fans.indexOf(req.body._id);
        var isFan = fanIndex == -1 ? false : true;
        var enemyIndex = story.enemies.indexOf(req.body._id);
        var isEnemy = enemyIndex == -1 ? false : true;
        if (isEnemy) {
            story.enemies.splice(enemyIndex, 1);
        } else {
            if (isFan) {
                story.fans.splice(fanIndex, 1);
            }
            story.enemies.addToSet(req.body._id);
            
        }
        story.score = wilsonScore(story.fans.length, story.enemies.length, story.created);
        console.log('Upvoting story' + story._id + ' with score: ' + story.score)
        story.save(function() {
            res.send({
                fans: story.fans,
                enemies: story.enemies,
                score: story.score
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Other routes
 |--------------------------------------------------------------------------
 */

// app.get('*', function(req, res) {
//     console.log('You sure about that, mate?');
//     res.redirect('/#' + req.originalUrl);
// });

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, {
        message: err.message
    });
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});