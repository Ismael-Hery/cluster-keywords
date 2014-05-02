var NGrams = require('natural').NGrams;
var async = require('async');
var S = require('string');

var stops = require('../node_modules/natural/lib/natural/util/stopwords_fr.js').words;
var lmApi = require('./lmApi');

/*
 * Exports
 */
exports.ensembleKeywords = ensembleKeywords;

// dirty module global var before further refactoring
var kwRegistry = {};

/**
 * Compute keywords for a ensemble
 * @param  {Integer} ensembleId Id of the ensemble in lmfr API
 * @return {nothing}            => to be refactored
 */
function ensembleKeywords(ensembleId) {
  lmApi.getEnsembleArticles(ensembleId, processArticles);
};

/**
 * Extract keywords from an array of articles returned from ensemble request API
 * @param  {Array} ensembleArticles List of articles, containing ids, useful for retrieving full articles
 * @return {nothing}                => To be refactored
 */
function processArticles(ensembleArticles) {
  var keywords = [];

  var articlesId = ensembleArticles.map(function(article) {
    return article.id;
  });

  console.log(articlesId);

  async.eachLimit(articlesId, 2, addArticleKeywords, function(err) {
    if (err)
      throw new Error('problem with one article');
    else {
      // When done, sort keywords by frequency
      Object.keys(kwRegistry).forEach(function(id) {
        keywords.push(kwRegistry[id]);
      });

      keywords = keywords.sort(function(a, b) {
        return b.count - a.count;
      });

      console.log('DONE:');
      console.log(keywords);
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

      if (kwRegistry[id] === undefined) {
        kwRegistry[id] = {
          keyword: keyword,
          count: 1
        };
      } else {
        kwRegistry[id].count = kwRegistry[id].count + 1;
      }
    });

    cb();
  });
};

/**
 * Extract keyword from a text
 * @param  {String} text Text to extract keyword from
 * @return {Array}       Ngram as an array of string
 */
function keywords(text) {

  var keywords = [];

  var sentenceBlocks = text.split(/\n|\.|\?|;|:|,|…|'|"|“|”|–|•|«|»/);

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
