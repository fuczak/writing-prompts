angular.module('Prompts')
    .factory('Prompt', ['$http',
        function($http) {
            return {
                submitPrompt: function(promptData) {
                	return $http.post('/api/prompt', promptData);
                },
                getAllPrompts: function() {
                	return $http.get('/api/prompts');
                },
                getPrompt: function(id) {
                	return $http.get('/api/prompts/' + id);
                },
                submitStory: function(storyData) {                    
                    return $http.post('/api/prompts/' + storyData.id + '/stories', storyData)
                },
                upvotePrompt: function(id, user) {
                    return $http.post('/api/prompts/' + id + '/upvote', user);
                },
                downvotePrompt: function(id, user) {
                    return $http.post('/api/prompts/' + id + '/downvote', user);
                },
                upvoteStory: function(id, user) {
                    return $http.post('/api/stories/' + id + '/upvote', user);
                },
                downvoteStory: function(id, user) {
                    return $http.post('/api/stories/' + id + '/downvote', user);
                }
            }
        }
    ]);