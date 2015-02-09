angular.module('Prompts')
	.filter('object2array', function() {
		return function(input) {
			var out = [];
			for(i in input) {
				out.push(input[i]);
			}
			return out;
		}
	});