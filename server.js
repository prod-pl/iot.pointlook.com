'use strict';
/**
* Load local config to env
*/
try{
  const localConfig = require('./config.local.js');
  for (let entry in localConfig){
    if (process.env[entry]){
      console.log('%s found in process.env too, ignore the local config val\n\t env vars always have precedence', entry);
    }
    else{
      process.env[entry] = localConfig[entry];
    }
  }
}
catch(e){
 console.log('No local config found');
  console.log(e);
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    var dep = require('dependency');

    //The value returned from the function is
    //used as the module export visible to Node.
    return function () {};
});

const debug = require('debug')('sigfox-callback:app');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const requirejs = require('requirejs');
const ua = require('universal-analytics');

/* init */
const app = express();
const port = process.env.PORT || 34000;
const server = http.createServer(app);
const db = require('./modules/db');
const requestLogger = require('./middlewares/requestLogger');
const visitor = ua('UA-69608609-4', {https: true});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.locals.moment = require('moment');


db.connect();
console.log("====> DB connected");
server.listen(port);

app.get('/', function (req, res) {
  console.log("===> GET /");
  visitor.pageview("/").send();
  res.sendfile(__dirname + '/views/index.html');
});

app.get('/sigfoxdown', function(req, res){
  console.log("===> GET /sigfoxdown");
    visitor.pageview("/sigfoxdown");
    console.log('===> Sigfox Downlink');
    res.format({
        json: function(){
                res.json({"C6F93" : { "downlinkData" : "babecafedeadbeef"}})
              }
    });
});

app.post('/sigfoxdown', requestLogger, function(req, res){
  console.log("===> POST /sigfoxdown");
    visitor.pageview("/sigfoxdown");
    console.log('===> Sigfox Downlink');
    res.format({
        json: function(){
                res.json({"C6F93" : { "downlinkData" : "babecafedeadbeef"}})
              }
    });
});

app.get('/iotlogs', function(req, res){
  console.log("===> GET /iotlogs");
  visitor.pageview("/iotlogs").send();
  console.log('Looking for logs');

  let entry = {
    method: req.method,
    path: req.url.replace(/\?(.*)$/, ''),
    time: new Date().getTime(),
    payload:req.body||{}
  };

  //querystring ?
  if (req.query && Object.keys(req.query).length){
    Object.keys(req.query).forEach(function(key){
      if (!entry.payload[key]){
        entry.payload[key] = req.query[key];
        console.log('===> GET /iotlogs queryString ', entry.payload[key])
      }
      else{
        console.log('===> WARN GET/POST conflict on %s', key);
        entry.payload['qry-'+key] = req.query[key];
      }
    });
  }

  console.log("===> path: ", entry.payload['deviceId']);
//  dbQuery = { path: '/update', payload:{$exists:true}}, {sort:{time:-1}};
// if (entry.payload['deviceId'] || entry.payload['deviceId'] !== "Device ID") dbQuery = "{path: entry.payload['deviceId'], payload:{$exists:true}}, {sort:{time:-1}}";
//  db.find('iotdata', dbQuery)
  var deviceID = '/' + entry.payload['deviceId'];

  db.find('iotdata', {path: deviceID, payload:{$exists:true}}, {sort:{time:-1}})
  .then(function(data){
    console.log('%s items found', data.length);
    res.format({
        /* JSON first */
        json: function(){
  console.log("===> IOTLOGS json");
            res.json({entries:data});
        },
        html: function(){
  console.log("===> IOTLOGS html");
            res.render('iotlogs', {title:'IoT messages', entries:data});
        },
        default:function(){
  console.log("===> IOTLOGS default");
            res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
        }
    });
  })
  .catch(function(err){
    res.format({
      json: function(){
  console.log("===> ERROR json");
          return res.json({err:'An error occured while fetching messages', details:err});
      },
      html: function(){
  console.log("===> ERROR html");
            return res.status(500).render('error.ejs', {title:'An error occured while fetching messages', err:err});
        },
      default: function(){
  console.log("===> ERROR default");
        res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
      }
    });
  });
});

app.post('/update', requestLogger, function(req, res){
  console.log("===> POST /update");
  debug('~~ POST request ~~');
  res.json({result:'♡'});
});



server.on('error', function(err){
    debug('ERROR %s', err);
});
server.on('listening', function(){
 debug('Server listening on port %s', port);
});
