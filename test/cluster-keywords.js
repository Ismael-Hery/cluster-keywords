var keywords = require('../lib/keywords');
var fs = require('fs');

// ukraine : 3485204
// tapie : 1821569 
//keywords.ensembleKeywords(1821569);

var articles = require('./cluster1.json').articles;

keywords.clusterKeywords(articles);