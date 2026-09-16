{
	"name": "svyqrcode-svyqrcodegenerator",
	"displayName": "QR Code Generator",
	"categoryName": "QR Code",
	"version": 1,
	"icon": "svyqrcode/svyqrcodegenerator/svyqrcodegenerator.png",
	"definition": "svyqrcode/svyqrcodegenerator/svyqrcodegenerator.js",
	"doc": "svyqrcode/svyqrcodegenerator/svyqrcodegenerator_doc.js",
	"model":
	{
		"dataProviderID"			: { "type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design", "doc": "The string value to encode as a QR code. When empty, the canvas is cleared." }},
		"errorCorrectionLevel"		: { "type": "string", "default": "M", "values": ["L", "M", "Q", "H"], "tags": { "scope" :"design", "doc": "QR error correction level: L (~7%), M (~15%), Q (~25%), H (~30%). Higher = more resilient but denser." }},
		"foregroundColor"			: { "type": "color", "default": "#000000", "tags": { "doc": "Color of the QR modules (dark cells)." }},
		"backgroundColor"			: { "type": "color", "default": "#FFFFFF", "tags": { "doc": "Color of the QR background (light cells) and the quiet-zone margin." }},
		"qrSize"					: { "type": "int", "default": 256, "tags": { "scope" :"design", "doc": "Pixel size (width and height) of the rendered QR code." }},
		"margin"					: { "type": "int", "default": 4, "tags": { "scope" :"design", "doc": "Quiet-zone margin around the QR code, in modules (default 4)." }},
		"designsize"				: { "type": "dimension", "tags": {"serveronly": true, "scope": "private"}, "default" : {"width":256, "height":256}}
	},
	"handlers":
	{
		"onError": {
			"description": "Fired when the QR code could not be generated",
			"doc": "Fired when the QR code could not be generated, e.g. when the input is too long for the chosen errorCorrectionLevel.",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "message", "type": "string" }
			]
		}
	},
	"api":
	{
		"getImageDataUrl": {
			"description": "Returns the current QR code rendered as a PNG data URL, or null if nothing is rendered",
			"doc": "Returns the currently rendered QR code as a PNG data URL, or null when no QR code has been rendered yet.",
			"returns": "string"
		}
	}
}
