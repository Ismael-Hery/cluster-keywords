var keywords = require('../lib/keywords');
var fs = require('fs');

var article1 = fs.readFileSync('text1.txt').toString();
var article2 = fs.readFileSync('text2.txt').toString();
var article3 = fs.readFileSync('text3.txt').toString();

//console.log(keywords.clusterKeywords([article1, article2, article3]));
keywords.ensembleKeywords(1821569);
