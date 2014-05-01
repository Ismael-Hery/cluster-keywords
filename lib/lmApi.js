var request = require('superagent');

var default_page_size = 30;

var apiBaseUrl = 'http://www-org.lemonde.fr/api/2/document/';

exports.getArticle = getArticle;
exports.getEnsembleArticles = getEnsembleArticles;

function getEnsembleArticles(ensembleID, ensembleCb) {
   var apiURL = apiBaseUrl + 'ensemble/' + ensembleID + '/elements/';
   request.get(apiURL).end(function (res) {
      ensembleCb(res.body.data);
   });
};

function getArticle(articleID, articleCB) {
   var apiURL = apiBaseUrl + 'element/' + articleID + '/';
   request.get(apiURL).end(function (res) {
      articleCB(res.body);
   });
};
