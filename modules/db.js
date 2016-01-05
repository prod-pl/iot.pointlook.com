'use strict';
/**
* Load local config to env
*/
try{
  const localConfig = require('./../config.local.js');
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

const debug = require('debug')('sigfox-callback:db');
const mongo = require('mongojs');
const format = require('util').format;
const dbUrl = process.env.DATABSE_URL || 'mongodb://rw:rw-2016@ds037395.mongolab.com:37395/iot';

module.exports = {
  db : undefined,
  connect : function() {
    this.db = mongo(dbUrl, ['iotdata']);

    this.db.on('error', function(err){
      console.log('DB Error - %s', err);
    });
    this.db.on('ready', function(){
      console.log('DB ready');
    });

    return;
  },
  insert: function(collectionName, data){
    console.log('==:=> Insert %o in %s', data, collectionName);
    return new Promise(function(resolve, reject){
      this.db[collectionName].insert(data, function(err, docs){
        if (err){
          console.log('==:=> Insert err — %s', err);
          return reject(err);
        }
        return resolve(docs);
      });
    }.bind(this));
  },
  /**
  * Find documents in a given collection
  *
  * @param {String} collectionName — name of the collection to look into
  * @param {Object} qry — The filter
  * @param {Object} options
  * @return {Promise}
  */
  find: function(collectionName, qry, options){
    if (!options){
      options = {};
    }
    return new Promise(function(resolve, reject){
      const sort = options.sort || {};
      const limit = options.limit || 100;
      const skip = options.skip || 0;
      delete options.sort;
      delete options.limit;

      this.db[collectionName]
      .find(qry, options)
      .sort(sort)
      .limit(limit)
      .toArray(function(err, docs){
        if (err){
          console.log('==:=> Find err — %s', err);
          return reject(err);
        }
        return resolve(docs);
      });
    }.bind(this));
  }
};
