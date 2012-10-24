var cluster = require('cluster'),
    os = require('os'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    querystring = require('querystring'),
    config = require('./config.js');

var numCPUs = os.cpus().length,
    port = config.port || 80,
    allow = config.allow || '*',
    httpServers = [],
    contentTypes = {
        'html': 'text/html',
        'json': 'application/json',
        'text': 'text/plain'
    };

function onRequest(request, response) {
    var parsedURL = url.parse(request.url),
        pathname = parsedURL.pathname.substring(1);

    if (!pathname || pathname === 'favicon.ico') {
        sendPageNotFound(response);
        return;
    }

    var contentType = contentTypes[pathname],
        options = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin' : allow
        };

    if (!contentType) {
        sendPageNotFound(response);
        return;
    }

    var query = querystring.parse(parsedURL.query),
        fetchURL = query.url,
        fetchOptions = url.parse(fetchURL),
        cache = query.cache === 'true',
        text = '';

    try {
        log('url: ' + fetchURL + ' time: ' + (new Date()).toString());
        http.get(fetchURL, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                text += chunk;
            }).on('end', function() {
                response.writeHead(200, options);
                response.write(text);
                response.end();
            });
        }).on('error', function(e) {
            sendPageNotFound(response);
        });
    } catch(e) {
        error('url: ' + fetchURL + ' time: ' + (new Date()).toString());
    }
}

function log(text) {
    var now = new Date(),
        dir = 'log/',
        filename = dir + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + '.txt';
    append(dir, filename, text);
}

function error(text) {
    var now = new Date(),
        dir = 'error/',
        filename = dir + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + '.txt';
    append(dir, filename, text);
}

function append(dir, filename, text) {
    fs.readdir(dir, function(err, files) {
        if (!files) {
            fs.mkdir(dir);
        }
        fs.appendFile(filename, text + '\n');
    });
}

function sendPageNotFound(response) {
    response.writeHead(404, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin' : '*'
    });
    response.end();
}

function start() {
    if (cluster.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
        });
    } else {
        // Workers can share any TCP connection
        // In this case its a HTTP server
        var httpServer = http.createServer(onRequest).listen(port);
        httpServers.push(httpServer);
        console.log('Cross-Domain Fetcher Server has started, listening ' + port + '.');
    }
}

start();