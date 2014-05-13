var keywords = require('../lib/keywords');
var fs = require('fs');
var lmApi = require('../lib/lmApi');

// ukraine : 3485204
// tapie : 1821569 
//keywords.ensembleKeywords(1821569);

var articles = require('./cluster1.json').articles;

keywords.printClusterKeywords(articles);

//lmApi.getClusterArticles(2774725);

/**
 * Results
 * 2774725 : 'intervention', 'soviétique', 'en', 'afghanistan'
 * 1861611 : 'guerre', 'en', 'extrême', 'orient'
 * 2119209 : 'accords', 'de', 'zurich' puis en second : 'affaire', 'de', 'chypre'
 * 3144841 : 'réforme', 'du', 'second', 'cycle'
 */