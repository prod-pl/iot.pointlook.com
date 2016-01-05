'use strict';
const db = require('../modules/db');
const debug = require('debug')('sigfox-callback:request-logger');
module.exports = function(req, res, next){
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
      }
      else{
        console.log('=:==> WARN GET/POST conflict on %s', key);
        entry.payload['qry-'+key] = req.query[key];
      }
    });

  }

  db.insert('iotdata', entry)
  .then(function(obj){
    console.log('=:==> Request log OK');
    console.log(obj);
    next();
  })
  .catch(function(err){
    console.log('=:==> Log err : %s', err);
    //return res.status(500).json({err:'Unable to log request', details:err.message});
    next();
  });
};
