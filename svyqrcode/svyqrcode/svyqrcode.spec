{
	"name": "svyqrcode-svyqrcode",
	"displayName": "QR Code",
	"version": 1,
	"definition": "svyqrcode/svyqrcode/svyqrcode.js",
	"libraries": [
		{"name":"jsQR.js", "version":"1.2.0", "url":"svyqrcode/svyqrcode/lib/jsQR.js", "mimetype":"text/javascript"}
	],
	"model":
	{
		"dataProviderID" 			: { "type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design" }},
		"showCodeFrame"				: { "type": "boolean", "default": true },
		"codeFrameColor"			: { "type": "color", "default": "#FF3B58" },
		"size" 						: { "type": "dimension", "default" : {"width":640, "height":480}},
		"callbackMethodTimeout"		: { "type": "int", "default": 1000, "tags": { "scope" :"design" } }
	},
	"handlers": 
	{
		"onCodeDetected": {
			"description": "Fired when a code is detected",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "code", "type": "string" }
			]
		}
	}
}