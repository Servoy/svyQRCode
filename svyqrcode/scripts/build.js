var AdmZip = require('adm-zip');

// creating archives
var zip = new AdmZip();

zip.addLocalFolder("./META-INF/", "/META-INF/");
zip.addLocalFolder("./dist/servoy/svyqrcode/", "/dist/servoy/svyqrcode/");
zip.addLocalFolder("./svyqrcode/", "/svyqrcode/");
zip.addLocalFolder("./svyqrcodegenerator/", "/svyqrcodegenerator/");

zip.writeZip("svyqrcode.zip");
