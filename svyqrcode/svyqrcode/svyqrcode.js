angular.module('svyqrcodeSvyqrcode', ['servoy']).directive('svyqrcodeSvyqrcode', function() {
		return {
			restrict: 'E',
			scope: {
				model: '=svyModel',
				api: "=svyApi",
				handlers: "=svyHandlers",
				svyServoyapi: "="
			},
			controller: function($scope, $element, $attrs, $utils) {
				//    	  var scanner = new QRScanner($element);

				var video = document.createElement('video');
				var canvasElement = $element.find('canvas')[0];
				var canvas = canvasElement.getContext("2d");
				var lastCodeDetected;

				navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
					video.srcObject = stream;
					video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
					video.play();
					requestAnimationFrame(tick);
				});

				function drawLine(begin, end, color) {
					canvas.beginPath();
					canvas.moveTo(begin.x, begin.y);
					canvas.lineTo(end.x, end.y);
					canvas.lineWidth = 4;
					canvas.strokeStyle = color;
					canvas.stroke();
				}

				function tick() {
					//    	      loadingMessage.innerText = "⌛ Loading video..."
					if (video.readyState === video.HAVE_ENOUGH_DATA) {
						//    	        loadingMessage.hidden = true;
						canvasElement.hidden = false;
						//    	        outputContainer.hidden = false;

		    	        canvasElement.height = video.videoHeight;
		    	        canvasElement.width = video.videoWidth;

						//    	        canvasElement.width =

						canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
						var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
						var code = jsQR(imageData.data, imageData.width, imageData.height, {
								inversionAttempts: "dontInvert",
							});
						if (code) {
							if ($scope.model.showCodeFrame) {
								drawLine(code.location.topLeftCorner, code.location.topRightCorner, $scope.model.codeFrameColor);
								drawLine(code.location.topRightCorner, code.location.bottomRightCorner, $scope.model.codeFrameColor);
								drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, $scope.model.codeFrameColor);
								drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, $scope.model.codeFrameColor);
							}
							
							var data = code.data;
							
							if (lastCodeDetected != data) {
								lastCodeDetected = data;
								if ($scope.model.dataProviderID) {
									$scope.model.dataProviderID = lastCodeDetected;
									$scope.svyServoyapi.apply('dataProviderID');
								}
								if ($scope.handlers.onCodeDetected) {
									var jsEvent = $utils.createJSEvent({target: canvasElement}, 'codeDetected');
									jsEvent.data = lastCodeDetected;
									$scope.handlers.onCodeDetected(jsEvent, lastCodeDetected);
								}
							}
							//    	          outputMessage.hidden = true;
							//    	          outputData.parentElement.hidden = false;
							//    	          outputData.innerText = code.data;
						} else {
							//    	          outputMessage.hidden = false;
							//    	          outputData.parentElement.hidden = true;
						}
					}
					requestAnimationFrame(tick);
				}
			},
			templateUrl: 'svyqrcode/svyqrcode/svyqrcode.html'
		};
	})