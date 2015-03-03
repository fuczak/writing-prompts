var path = require('path');
var qs = require('querystring');
var async = require('async');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var request = require('request');
var decay = require('decay');
var hotScore = decay.redditHot(135000);
var wilsonScore = decay.wilsonScore();
var User = require('./models/User');
var Prompt = require('./models/Prompt');
var Story = require('./models/Story');
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
    Prompt.find().sort('-lastUpdated').limit(50).exec(function(err, prompts) {
        if (err) return console.log(err)
        async.waterfall([

            function(callback) {
                var candidates = [];
                for (i = 0; i < prompts.length; i++) {
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
}, 1000 * 60 * 10);

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
 | GET user submission history
 |--------------------------------------------------------------------------
 */

app.get('/api/profile/:displayName', ensureAuthenticated, function(req, res) {
    User.findOne({
        displayName: req.params.displayName
    }).select('prompts stories displayName').populate('prompts stories', ' -__v -score -enemies -fans -user -lastUpdated -stories').exec(function(err, user) {
        if (err) {
            res.status(404).send({
                message: 'User not found.'
            });
        }
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */

app.get('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
        if (err) {
            return res.status(409).send({
                message: 'Server took too long to respond, please refresh'
            })
        }
    }).populate('prompts stories likedPrompts likedStories', '-__v -score -enemies -fans -user -lastUpdated -stories').exec(function(err, user) {
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, '+password', function(err, user) {
        if (!user) {
            return res.status(400).send({
                message: 'User not found'
            });
        }
        user.email = req.body.email || user.email;
        if (!!req.body.password) {
            user.comparePassword(req.body.oldPassword, function(err, isMatch) {
                console.log(!isMatch)
                if (!isMatch) {
                    return res.status(401).send({
                        message: 'Wrong password'
                    });
                } else {
                    user.password = req.body.password || user.password;
                    user.save(function(err) {
                        res.status(200).end();
                    })
                }
            });
        } else {
            user.save(function(err) {
                if (err) return res.status(409).send({
                    message: 'Username and/or Email are already taken'
                });
                res.status(200).end();
            });
        }
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
 | Forgot password
 |--------------------------------------------------------------------------
 */

app.post('/api/forgot', function(req, res) {
    console.log('init')
    async.waterfall([

        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    res.status(404).send({
                        message: 'No account with that email address exists'
                    });
                    return
                }
                user.resetPasswordToken = token;
                user.resetTokenExpires = Date.now() + 3600000;
                user.save(function(err) {
                    done(err, token, user)
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: config.SENDGRID_USERNAME,
                    pass: config.SENDGRID_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'writing-prompts@herokuapp.com',
                subject: 'Writing-prompts password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err)
                    res.status(403).send({
                        message: 'An error has occurred, please try again in few minutes.'
                    })
                } else {
                    console.log(info)
                    res.status(200).send({
                        message: 'An email has been sent to ' + req.body.email + '. Please follow further instructions.'
                    });
                }
            });
        }
    ])
});

/*
 |--------------------------------------------------------------------------
 | Reset password
 |--------------------------------------------------------------------------
 */

app.post('/reset/:token', function(req, res) {
    async.waterfall([

        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetTokenExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (!user) {
                    res.status(403).send({
                        message: 'Password reset token is invalid or has expired.'
                    })
                    return
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetTokenExpires = undefined;

                user.save(function(err) {
                    done(err, user)
                })
            })
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: config.SENDGRID_USERNAME,
                    pass: config.SENDGRID_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'writing-prompts@herokuapp.com',
                subject: 'Your writing-prompts password has been reset',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err)
                    res.status(403).send({
                        message: 'An error has occurred, please try again in few minutes.'
                    })
                } else {
                    console.log(info)
                    res.status(200).send({
                        message: 'Your password has been successfully changed. Please log in.'
                    })
                }
            });
        }
    ])
})

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
        },
        fans: req.body.user._id
    });
    prompt.save(function() {
        User.findById(prompt.user, function(err, user) {
            if (err) {
                res.status(404).send({
                    message: 'The server had trouble identifying you. Please re-log.'
                })
            } else {
                user.prompts.push(prompt);
                user.save(function() {
                    res.send(prompt);
                });
            }
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Delete a new Prompt (actually unlink it from creator)
 |--------------------------------------------------------------------------
 */

app.delete('/api/prompts/:slug/remove', ensureAuthenticated, function(req, res) {
    Prompt.findOne({
        slug: req.params.slug
    }, function(err, prompt) {
        if (err) {
            res.status(409).send(err)
        }
        User.findById(req.user, function(err, user) {
            if (err) {
                res.status(409).send(err)
            }
            if (prompt.user._id == req.user) {
                user.prompts.pull(prompt);
                prompt.user.displayName = 'deleted';
                prompt.user._id = undefined;
                user.save(function() {
                    prompt.save(function() {
                        res.send({
                            prompt: {
                                user: {
                                    displayName: 'deleted'
                                },
                                _id: prompt._id
                            }
                        });
                    });
                });
            } else {
                res.status(403).send({
                    message: 'Only an author can delete a prompt.'
                });
            }
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Get all Prompts (Hottest)
 |--------------------------------------------------------------------------
 */

app.get('/api/prompts', function(req, res) {
    Prompt.find().sort('-score').limit(20).exec(function(err, prompts) {
        if (err) {
            res.status(409).send(res.body)
        }
        res.send(prompts);
    });
});

/*
 |--------------------------------------------------------------------------
 | Get all Prompts (Newest)
 |--------------------------------------------------------------------------
 */

app.get('/api/prompts/newest', function(req, res) {
    Prompt.find().sort('-created').limit(20).exec(function(err, prompts) {
        if (err) {
            res.status(409).send(res.body)
        }
        res.send(prompts);
    });
});

/*
 |--------------------------------------------------------------------------
 | Get a specific Prompt
 |--------------------------------------------------------------------------
 */

app.get('/api/prompts/:slug', function(req, res) {
    Prompt.findOne({
        slug: req.params.slug
    }, function(err, prompt) {
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

app.post('/api/prompts/:slug/stories', ensureAuthenticated, function(req, res) {
    var story = new Story({
        story: req.body.story,
        user: {
            _id: req.body.user._id,
            displayName: req.body.user.displayName
        },
        prompt: {
            _id: req.body.prompt.id,
            slug: req.body.prompt.slug
        },
        fans: req.body.user._id
    });
    story.save(function(err, story) {
        if (err) {
            res.status(409).send({
                message: 'Server had trouble saving your story. Please re-log to fix it.'
            })
        } else {
            Prompt.findById(req.body.prompt.id, function(err, prompt) {
                if (err) {
                    res.status(409).send({
                        message: 'prompt findbyid error'
                    })
                }
                prompt.stories.push(story);
                prompt.save(function(err, prompt) {
                    if (err) {
                        res.status(409).send({
                            message: 'prompt save error'
                        })
                    }
                    User.findById(story.user._id, function(err, user) {
                        if (err) {
                            res.status(409).send({
                                message: 'user findbyid save error'
                            })
                        }
                        user.stories.push(story);
                        user.save(function() {
                            res.send(story);
                        });
                    });
                });
            });
        }
    });
});

/*
 |--------------------------------------------------------------------------
 | Update a story
 |--------------------------------------------------------------------------
 */

 app.put('/api/stories/:id/update', ensureAuthenticated, function(req, res) {
    Story.findById(req.params.id, function(err, story) {
        if (err) {
            res.status(404).send({
                message: 'Story not found'
            })
        }
        if (story.user._id == req.user) {
            story.story = req.body.story;
            story.save(function() {
                res.send({
                    message: 'Story has been successfully updated'
                })
            })
        } else {
            res.status(403).send({
                message: "You can't edit stories submitted by other users!"
            })
        }
    })
 })

/*
 |--------------------------------------------------------------------------
 | Delete a story
 |--------------------------------------------------------------------------
 */

app.delete('/api/stories/:id/remove', ensureAuthenticated, function(req, res) {
    console.log(req.params)
    Story.findById(req.params.id, function(err, story) {
        if (err) {
            res.status(404).send(err)
        }
        story.remove(function() {
            res.send({
                message: 'Story has been successfully removed'
            })
        })
    })
});

/*
 |--------------------------------------------------------------------------
 | Upvoting prompt
 |--------------------------------------------------------------------------
 */

app.post('/api/prompts/:id/upvote', ensureAuthenticated, function(req, res) {
    Prompt.findById(req.params.id, function(err, prompt) {
        if (err) {
            res.status(409).send(err);
        }
        User.findById(req.body._id, function(err, user) {
            if (err) {
                res.status(400).send(err)
            }
            var fanIndex = prompt.fans.indexOf(user._id);
            var isFan = fanIndex == -1 ? false : true;
            var enemyIndex = prompt.enemies.indexOf(user._id);
            var isEnemy = enemyIndex == -1 ? false : true;
            prompt.lastUpdated = Date.now();
            if (isFan) {
                prompt.fans.splice(fanIndex, 1);
                user.likedPrompts.pull(prompt._id)
            } else {
                if (isEnemy) {
                    prompt.enemies.splice(enemyIndex, 1);
                }
                prompt.fans.addToSet(user._id);
                user.likedPrompts.addToSet(prompt._id)
            }
            user.save(function() {
                prompt.save(function() {
                    res.send({
                        fans: prompt.fans,
                        enemies: prompt.enemies
                    });
                });
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
            res.status(409).send(err);
        }
        User.findById(req.body._id, function(err, user) {
            if (err) {
                res.status(409).send(err)
            }
            var fanIndex = prompt.fans.indexOf(user._id);
            var isFan = fanIndex == -1 ? false : true;
            var enemyIndex = prompt.enemies.indexOf(user._id);
            var isEnemy = enemyIndex == -1 ? false : true;
            prompt.lastUpdated = Date.now();
            if (isEnemy) {
                prompt.enemies.splice(enemyIndex, 1);
            } else {
                if (isFan) {
                    prompt.fans.splice(fanIndex, 1);
                    user.likedPrompts.pull(prompt._id);
                }
                prompt.enemies.addToSet(user._id);
            }
            user.save(function() {
                prompt.save(function() {
                    res.send({
                        fans: prompt.fans,
                        enemies: prompt.enemies
                    });
                });
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
            res.status(409).send(err);
        }
        User.findById(req.body._id, function(err, user) {
            if (err) {
                res.status(409).send(err)
            }
            var fanIndex = story.fans.indexOf(user._id);
            var isFan = fanIndex == -1 ? false : true;
            var enemyIndex = story.enemies.indexOf(user._id);
            var isEnemy = enemyIndex == -1 ? false : true;
            story.lastUpdated = Date.now();
            if (isFan) {
                story.fans.splice(fanIndex, 1);
                user.likedStories.pull(story._id);
            } else {
                if (isEnemy) {
                    story.enemies.splice(enemyIndex, 1);
                }
                story.fans.addToSet(user._id);
                user.likedStories.addToSet(story._id);
            }
            story.score = wilsonScore(story.fans.length, story.enemies.length, story.created);
            user.save(function() {
                story.save(function() {
                    res.send({
                        fans: story.fans,
                        enemies: story.enemies,
                        score: story.score
                    });
                });
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
            res.status(409).send(err);
        }
        User.findById(req.body._id, function(err, user) {
            if (err) {
                res.status(409).send(err);
            }
            var fanIndex = story.fans.indexOf(user._id);
            var isFan = fanIndex == -1 ? false : true;
            var enemyIndex = story.enemies.indexOf(user._id);
            var isEnemy = enemyIndex == -1 ? false : true;
            story.lastUpdated = Date.now();
            if (isEnemy) {
                story.enemies.splice(enemyIndex, 1);
            } else {
                if (isFan) {
                    story.fans.splice(fanIndex, 1);
                    user.likedStories.pull(story._id);
                }
                story.enemies.addToSet(user._id);
            }
            story.score = wilsonScore(story.fans.length, story.enemies.length, story.created);
            user.save(function() {
                story.save(function() {
                    res.send({
                        fans: story.fans,
                        enemies: story.enemies,
                        score: story.score
                    });
                });
            });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Other routes
 |--------------------------------------------------------------------------
 */

app.all('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, {
        message: err.message
    });
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});