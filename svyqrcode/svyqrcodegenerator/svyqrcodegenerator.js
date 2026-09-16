angular.module('svyqrcodeSvyqrcodegenerator', ['servoy']).directive('svyqrcodeSvyqrcodegenerator', function() {
		return {
			restrict: 'E',
			scope: {
				model: '=svyModel',
				api: "=svyApi",
				handlers: "=svyHandlers",
				svyServoyapi: "="
			},
			controller: function($scope, $element) {
			},
			templateUrl: 'svyqrcode/svyqrcodegenerator/svyqrcodegenerator.html'
		};
	})
