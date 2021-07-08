  var ObjectId, bodyParser, checkauth, ejs, express, fs, helmet, http, httpOptions, https, MongoClient, mongodb, path, secureServer, MongoURL;

  multer  = require('multer');
  
  _req = require('request');

  _ = require('underscore');

  _date = require('moment');

  express = require('express');

  app = express();

  https = require('https');

  http = require('http');

  bodyParser = require('body-parser');

  fs = require('fs');

  path = require('path');

  ejs = require('ejs');

  port = process.argv[2];

  mongodb = require('mongodb');

  ObjectId = mongodb.ObjectID;

  MongoId = mongodb.ObjectID;

  MongoClient = mongodb.MongoClient;

  helmet = require('helmet');

  if (process.argv[3] == 'live') {
    config = require('./config/live_config.json');
  } else {
    config = require('./config/dev_config.json');
  }
  
  secureServer = http.createServer(app);

  app.engine('html', ejs.renderFile);

  app.set('view engine', 'ejs');

  app.set('views', path.join(__dirname, 'views'));

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use(express.static('views'));

  app.use(helmet());

  config = module.exports = config;
  app = module.exports = app;
  
  c = module.exports = function(arr){  for(var i = 0; i < arguments.length; i++) {
                                          if(config.IS_DEV){
                                            console.log(arguments[i]);
                                          }
                                        }
                                    };
  
  
  /*=========================================================
      MODULE EXPORTS started here
  ===========================================================*/

  common = module.exports = require('./classes/common.js');
  urlHandler = module.exports = require('./classes/urlHandler.js');

  /*=========================================================
        MODULE EXPORTS ended here
  ===========================================================*/





  /*=========================================================
        Mongo Db connection start here.
  ===========================================================*/
  
  if(typeof process.argv[3] != 'undefined' && process.argv[3] == 'live'){
    
    MongoURL = 'mongodb://'+config.MongoDB.USERNAME+':'+config.MongoDB.PASSWORD+'@'+config.MongoDB.HOST+':'+config.MongoDB.PORT+'/'+config.MongoDB.DBNAME;

  }else{

    MongoURL = 'mongodb://'+config.MongoDB.HOST+':'+config.MongoDB.PORT;

  }
  
  MongoClient.connect(MongoURL, (err, client) => {
    if (err) {
      throw err;
    } else {
      console.log(typeof process.argv[3] != 'undefined' ? 'live' : 'local', 'mongodb connection started...');
      db = module.exports = client.db(config.MongoDB.DBNAME);
      urlHandler.RestApi();
      db.collection('catalogs').find({}).sort({'created_at': 1}).toArray((err, results)=>{
        if(results.length){
          var output = [], n, padded;
          for (n=0; n<=20; n++) {
              padded = ('0'+n).slice(-2); // Prefix three zeros, and get the last 4 chars
              output.push(padded);
          }
          temp(results, output, 0, (done)=>{
            console.log(done);
          })
          function temp(data, tt, i, done){
            db.collection('products').find({'catalogId': data[i].catalogID}).sort({'created_at': 1}).toArray((err, results1)=>{
                if(results1.length){
                  temp1(results1, tt, 0, (done1)=>{
                    if(typeof data[++i] != 'undefined'){
                      temp(data, tt, i, done);
                    }else{
                      return done('OK');
                    }
                  })
                }else{
                  if(typeof data[++i] != 'undefined'){
                    temp(data, tt, i, done);
                  }else{
                    return done('OK');
                  }
                }
                function temp1(data, tt, j, done1){
                  console.log("tt[j] :::: ", tt[j]);
                   db.collection('products').update({_id: data[j]._id}, {$set: {'id': tt[j]}}, (err, results)=>{
                     if(typeof data[++j] != 'undefined'){
                        temp1(data, tt, j, done1);
                      }else{
                        return done1('OK');
                      }
                   })
                }
            })
          }

        }
      })
    }
  });

  /*=========================================================
        Mongod Db connection Ends.
  ===========================================================*/

  secureServer.listen(port, () => {
    return console.log(`server listen at :: ${port}`);
  });
