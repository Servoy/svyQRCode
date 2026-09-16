{
	"name": "svyqrcode-svyqrcode",
	"displayName": "QR Code",
	"categoryName": "QR Code",
	"version": 1,
	"icon": "svyqrcode/svyqrcode/svyqrcode.png",
	"definition": "svyqrcode/svyqrcode/svyqrcode.js",
	"doc": "svyqrcode/svyqrcode/svyqrcode_doc.js",
	"libraries": [
		{"name":"jsQR.js", "version":"1.2.0", "url":"svyqrcode/svyqrcode/lib/jsQR.js", "mimetype":"text/javascript"}
	],
	"model":
	{
		"dataProviderID" 			: { "type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design", "doc": "Two-way bound dataprovider that receives the decoded QR code value." }},
		"showCodeFrame"				: { "type": "boolean", "default": true, "tags": { "doc": "When true, draws an outline around the detected code in the video preview." }},
		"codeFrameColor"			: { "type": "color", "default": "#FF3B58", "tags": { "doc": "Color of the outline drawn around the detected code." }},
		"designsize" 				: { "type": "dimension", "tags": {"serveronly": true, "scope": "private"}, "default" : {"width":640, "height":480}},
		"callbackMethodTimeout"		: { "type": "int", "default": 1000, "tags": { "scope" :"design", "doc": "Minimum interval (ms) between two onCodeDetected calls for the same value." } }
	},
	"handlers": 
	{
		"onCodeDetected": {
			"description": "Fired when a code is detected",
			"doc": "Fired when a QR code is detected. Throttled by callbackMethodTimeout.",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "code", "type": "string" }
			]
		}
	}
}
