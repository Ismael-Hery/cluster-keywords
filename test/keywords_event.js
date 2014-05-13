var keywords = require('../lib/keywords');
var http = require('http');

var req = http.request({
  hostname: '172.30.2.152',
  port: 3000,
  path: '/event/'+process.argv[2]+'?limit=1000',
  method: 'GET',
  headers: {'Accept': 'application/json'}
}, function(res) {
  res.setEncoding('utf8');
  var ans = '';
  res.on('data', function(chunk) { ans += chunk; });
  res.on('end', function() {
    var result = JSON.parse(ans).articles;
    if(!result) result = [];
    keywords.printClusterKeywords(result);
  });
});
req.on('error', console.error);
req.end();
