var domain  = require('domain'),
    express = require('express');

app = express();

//debug('environment: ', app.get('env'));

app.set('port', process.env.port || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(function(req, res, next){
    var requestDomain = domain.create();
    requestDomain.add(req);
    requestDomain.add(res);
    requestDomain.on('error', next);
    requestDomain.run(next);
});

if ('development' == app.get('env')) {
    app.use(express.logger({ immediate: true, format: 'dev'}))
}
else {
    app.use(express.logger())
}

app.use(express.basicAuth('Cloudguides', 'ElisTest24;'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());

app.use(express.static(__dirname + '/public'));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

module.exports = app;