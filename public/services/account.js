angular.module('Prompts')
  .factory('Account', ['$http', function($http) {
    return {
      getProfile: function() {
        return $http.get('/api/me');
      },
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      },
      getUser: function(displayName) {
        return $http.get('/api/profile/' + displayName);
      },
      resetPassword: function(email) {  
        return $http.post('/api/forgot', email);
      },
      updatePassword: function(password, token) {
        return $http.post('/reset/' + token, password)
      }
    };
  }]);