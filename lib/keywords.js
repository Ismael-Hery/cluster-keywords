var natural = require('natural');
var NGrams = natural.NGrams;
var T = require('../node_modules/natural/lib/natural/tokenizers/aggressive_tokenizer_fr');
var t = new T();
NGrams.setTokenizer(t);
var async = require('async');
var S = require('string');
var _ = require('underscore');

var stops = require('../node_modules/natural/lib/natural/util/stopwords_fr.js').words;
var lmApi = require('./lmApi');
var eventWords = require('./eventWords').events;

/*
 * Exports
 */
exports.ensembleKeywords = ensembleKeywords;
exports.printClusterKeywords = printClusterKeywords;

// Useful to record online new keywords 
var kwRegistry = {};
var articlesRegistry = {};

var minFrequency = 0.05;

/**
 * Compute keywords for a LMFR ensemble
 * @param  {Integer} ensembleId Id of the ensemble in lmfr API
 * @return {nothing}            => to be refactored
 */
function ensembleKeywords(ensembleId) {
  lmApi.getEnsembleArticles(ensembleId, processArticles);
};

/**
 * Compute keywords for an historic cluster
 * @param  {Integer} cluster Id
 * @return {nothing} => print keywords, to be refactored
 */
function printClusterKeywords(articles) {
  var keywords = [];

  articles.forEach(function(article) {
    addArticleKwsToClusterKws(article, 3);
    addArticleKwsToClusterKws(article, 4);
    addArticleKwsToClusterKws(article, 5);
  });


  Object.keys(kwRegistry).forEach(function(id) {
    kwRegistry[id].foundInArticles = _.uniq(kwRegistry[id].foundInArticles);
    kwRegistry[id].frequency = kwRegistry[id].foundInArticles.length / articles.length;

    if (kwRegistry[id].frequency >= minFrequency)
      keywords.push(kwRegistry[id]);
  });



  keywords = keywords.sort(function(a, b) {
    return b.frequency - a.frequency;
  });

  var privilegedKw = privilegedKeywords(keywords);

  console.log('DONE.');
  console.log('PRIVILEGED KEYWORDS:');
  console.log(privilegedKw);
  console.log('ALL KEYWORDS:');
  console.log(keywords);
};

/**
 * Add one article keywords into registry
 * @param {Object}   article   Article as returned from cluster api, with fields id and title and content
 * @param {Integer}  ngramSize
 */
function addArticleKwsToClusterKws(article, ngramSize) {

  var text = '';
  if (article.title !== undefined)
    text = text + S(article.title).stripTags().s + '\n';

  if (article.content !== undefined)
    text = text + S(article.content).stripTags().s + '\n';

  var articleKeywords = keywords(text, ngramSize);

  articleKeywords.forEach(function(keyword) {
    var kwId = keyword.join('').toLowerCase();

    if (kwRegistry[kwId] === undefined) {
      kwRegistry[kwId] = {
        keyword: keyword,
        foundInArticles: []
      };
    }

    kwRegistry[kwId].foundInArticles.push(article.id);

  });

};

/**
 * Extract keywords from an array of articles returned from ensemble request API
 * @param  {Array} ensembleArticles List of articles, containing ids, useful for retrieving full articles
 * @return {nothing}                => To be refactored
 */
function processArticles(ensembleArticles) {
  var keywords = [];
  var minFrequency = 0.1;

  var articlesId = ensembleArticles.map(function(article) {
    return article.id;
  });

  console.log(articlesId);

  async.eachLimit(articlesId, 2, addArticleKeywords, function(err) {
    if (err)
      throw new Error('problem with one article');
    else {
      // When done, compute frequency amongst documents and sort keywords by frequency
      Object.keys(kwRegistry).forEach(function(id) {
        kwRegistry[id].foundInArticles = _.uniq(kwRegistry[id].foundInArticles);
        kwRegistry[id].frequency = kwRegistry[id].foundInArticles.length / articlesId.length;

        if (kwRegistry[id].frequency >= minFrequency)
          keywords.push(kwRegistry[id]);
      });

      keywords = keywords.sort(function(a, b) {
        return b.frequency - a.frequency;
      });

      var privilegedKw = privilegedKeywords(keywords);

      console.log('DONE.');
      console.log('PRIVILEGED KEYWORDS:');
      console.log(privilegedKw);
      console.log('ALL KEYWORDS:');
      console.log(keywords);
    }

  });

};

/**
 * Add one article keywords into registry
 * @param {[type]}   articleId Article ID to retrieve keywords and add them in registry
 * @param {Function} cb        Callback as required by async API
 */
function addArticleKeywords(articleId, cb) {
  lmApi.getArticle(articleId, function(article) {

    var text = '';
    if (article.titre !== undefined)
      text = text + S(article.titre).stripTags().s + '\n';

    if (article.element_data.texte !== undefined)
      text = text + S(article.element_data.texte).stripTags().s + '\n';

    var articleKeywords = keywords(text);

    articleKeywords.forEach(function(keyword) {
      var kwId = keyword.join('').toLowerCase();

      if (kwRegistry[kwId] === undefined) {
        kwRegistry[kwId] = {
          keyword: keyword,
          foundInArticles: []
        };
      }

      kwRegistry[kwId].foundInArticles.push(articleId);

    });

    cb();
  });
};

/**
 * Extract keyword from a text
 * @param  {String}  text      Text to extract keyword from
 * @param  {Integer} ngramSize
 * @return {Array}       Ngram as an array of string
 */
function keywords(text, ngramSize) {
  var keywords = [];

  var sentenceBlocks = text.split(/\n|\.|\?|;|:|,|…|'|"|“|”|–|•|«|»/);

  sentenceBlocks.forEach(function(block) {
    var ngrams = NGrams.ngrams(block.toLowerCase(), ngramSize);

    ngrams.forEach(function(ngram) {
      if (validNgram(ngram))
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

function privilegedKeywords(keywords) {

  return keywords.filter(function(keyword) {
    return eventWords.indexOf(keyword.keyword[0]) !== -1;
  });

}
