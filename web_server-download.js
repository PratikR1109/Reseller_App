  var ObjectId, bodyParser, checkauth, ejs, express, fs, helmet, http, httpOptions, https, MongoClient, mongodb, path, secureServer, urlHandler, MongoURL;
  
  session = require('express-session');
  
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
  
  ex = require('./config/xpressbees.json');
  
  if (process.argv[3] == 'live') {
    config = require('./config/live_config.json');
  } else {
    config = require('./config/dev_config.json');
  }
  
  secureServer = http.createServer(app);

  app.use(session({secret: 'ssshhhhh'}));

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
//  webHandler = module.exports = require('./classes/webHandler.js');

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
  //    webHandler.Routes(app);
app.get('/shoe.zip', (req, res)=>{
var pp = require('path').join(__dirname, './views/img/media/shoe.zip');
console.log("pp", pp);
			res.download(require('path').join(__dirname, 'views/img/media/shoe.zip'));
		})
		app.get('/aeroplane.zip', (req, res)=>{
			res.download(require('path').join(__dirname, 'views/img/media/smallAeroplane.zip'));
		})
    }
  });

  /*=========================================================
        Mongod Db connection Ends.
  ===========================================================*/

  secureServer.listen(port, () => {
    return console.log(`server listen at :: ${port}`);
  });
