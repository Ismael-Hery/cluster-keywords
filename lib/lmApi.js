var request = require('superagent');

var default_page_size = 30;

var apiBaseUrl = 'http://prive.www.lemonde.fr/api/2/document/';

exports.getArticle = getArticle;
exports.getEnsembleArticles = getEnsembleArticles;
exports.getClusterArticles = getClusterArticles;

/**
 * Retrieve articles and their content for a given cluster ID
 * @param  {Integer}   clusterID
 * @param  {Function}  cb         callback
 */
function getClusterArticles(clusterID, cb) {
  var apiURL = 'http://172.30.2.152:3000/event/' + clusterID;

  console.log('URL called:', apiURL);

  request.get(apiURL).set('Accept', 'application/json').end(function(res) {
    if (res.ok)
      console.log('Ok',res);
    else
      console.log('problem in getCluster request:', res.text);
  });
};

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