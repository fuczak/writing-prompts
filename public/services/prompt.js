angular.module('Prompts')
    .factory('Prompt', ['$http',
        function($http) {
            return {
                submitPrompt: function(promptData) {
                	return $http.post('/api/prompt', promptData);
                },
                removePrompt: function(prompt) {
                    return $http.delete('/api/prompts/' + prompt.slug + '/remove');
                },
                getAllPrompts: function() {
                	return $http.get('/api/prompts');
                },
                getNewestPrompts: function() {
                    return $http.get('/api/prompts/newest');
                },
                getPrompt: function(slug) {
                	return $http.get('/api/prompts/' + slug);
                },
                submitStory: function(storyData) {                
                    return $http.post('/api/prompts/' + storyData.slug + '/stories', storyData);
                },
                editStory: function(story) {
                    return $http.put('/api/stories/' + story._id + '/update', story);
                },
                removeStory: function(story) {
                    return $http.delete('/api/stories/' + story._id +'/remove');
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