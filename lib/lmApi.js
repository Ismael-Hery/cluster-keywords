var request = require('superagent');

var default_page_size = 30;

var apiBaseUrl = 'http://prive.www.lemonde.fr/api/2/document/';

exports.getArticle = getArticle;
exports.getEnsembleArticles = getEnsembleArticles;

function getEnsembleArticles(ensembleID, ensembleCb) {
  var apiURL = apiBaseUrl + 'ensemble/' + ensembleID + '/elements/?limit=20';
  request.get(apiURL).end(function(res) {
    if (res.ok)
      ensembleCb(res.body.data);
    else
      console.log('problem in getEnsemble request:', res.text);
  });
};

function getArticle(articleID, articleCB) {
  var apiURL = apiBaseUrl + 'element/' + articleID + '/';
  request.get(apiURL).end(function(res) {
    if (res.ok)
      articleCB(res.body);
    else
      console.log('problem in getArticle request:', res.text);
  });
};