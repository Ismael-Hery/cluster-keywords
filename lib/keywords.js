var NGrams = require('natural').NGrams;
var stops = require('../node_modules/natural/lib/natural/util/stopwords_fr.js').words;
var lmApi = require('./lmApi');

exports.clusterKeywords = clusterKeywords;
exports.ensembleKeywords = ensembleKeywords;

function ensembleKeywords(ensembleId){
  lmApi.getEnsembleArticles(ensembleId, processArticles);
};

function processArticles(articles){
  var articlesId = articles.map(function(article){
    return article.id;
  });

  console.log(articlesId);

};

function clusterKeywords(articles) {

  var registry = {};
  var found = [];

  articles.forEach(function(article) {
    var articleKeywords = keywords(article);

    articleKeywords.forEach(function(keyword) {
      var id = keyword.join('').toLowerCase();

      if (registry[id] === undefined) {
        registry[id] = {
          keyword: keyword,
          count: 1
        };
      } else {
        registry[id].count = registry[id].count + 1;
      }
    });

  });

  Object.keys(registry).forEach(function(id) {
    found.push(registry[id]);
  });

  return found.sort(function(a, b) {
    return b.count - a.count;
  });

};


function keywords(article) {

  var keywords = [];

  var sentenceBlocks = article.split(/\n|\.|\?|;|:|,|…|'|"|“|”|–|•|«|»/);

  sentenceBlocks.forEach(function(block) {
    var ngrams = NGrams.ngrams(block.toLowerCase(), 4);

    ngrams.forEach(function(ngram) {
      if (isOk(ngram))
        keywords.push(ngram);
    });

  });

  return keywords;

};


function isOk(ngram){
  if(stops.indexOf(ngram.slice(-1)[0]) === -1){
    return true;
  }
  else {
    return false;
  }

}
