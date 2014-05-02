var NGrams = require('natural').NGrams;
var async = require('async');
var S = require('string');

var stops = require('../node_modules/natural/lib/natural/util/stopwords_fr.js').words;
var lmApi = require('./lmApi');

exports.clusterKeywords = clusterKeywords;
exports.ensembleKeywords = ensembleKeywords;

var registry = {};

function ensembleKeywords(ensembleId) {
  lmApi.getEnsembleArticles(ensembleId, processArticles);
};

function processArticles(articles) {
  var found = [];

  var articlesId = articles.map(function(article) {
    return article.id;
  });

  console.log(articlesId);

  async.eachLimit(articlesId, 2, addArticleKeywords, function(err) {
    if (err)
      throw new Error('problem with one article');
    else {
      console.log('DONE:');

      Object.keys(registry).forEach(function(id) {
        found.push(registry[id]);
      });

      found = found.sort(function(a, b) {
        return b.count - a.count;
      });

      console.log(found);
    }

  });

};

function addArticleKeywords(articleId, cb) {
  lmApi.getArticle(articleId, function(article) {

    var text = '';
    if (article.titre !== undefined)
      text = text + S(article.titre).stripTags().s + '\n';

    if (article.element_data.texte !== undefined)
      text = text + S(article.element_data.texte).stripTags().s + '\n';

    var articleKeywords = keywords(text);

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

    cb();
  });
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
    var ngrams = NGrams.ngrams(block.toLowerCase(), 3);

    ngrams.forEach(function(ngram) {
      if (validNgram (ngram))
        keywords.push(ngram);
    });

  });

  return keywords;

};

/**
 * Tells if an ngram should be kept or not. It refuses ngram starting or ending by a stop word
 * @param  {Array}  ngram Ngram of words
 * @return {Boolean}      True if it is a valid ngram, false otherwise
 */
function validNgram(ngram) {
  if (stops.indexOf(ngram.slice(-1)[0]) === -1 && stops.indexOf(ngram[0]) === -1) {
    return true;
  } else {
    return false;
  }

}
