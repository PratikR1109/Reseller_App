  var files = require('./fileUploads.js');
  var ex = require('../config/xpressbees.json');
  
  module.exports = {

    getSenderDetailsFormat: (data)=>{
      var sender = {
        name: typeof data.name != 'undefined' ? data.name : '',
        phone_no: typeof data.phone_no != 'undefined' ? data.phone_no : '',
        resellerId: typeof data.resellerId != 'undefined' ? data.resellerId : ''
      };
      return sender;
    },
    getAddressDetailsFormat: (data)=>{
      var addresses = {
        resellerId: typeof data.resellerId != 'undefined' ? data.resellerId : '',
        name: typeof data.name != 'undefined' ? data.name : '',
        phone_no: typeof data.phone_no != 'undefined' ? data.phone_no : '',
        building: typeof data.building != 'undefined' ? data.building : '',
        street: typeof data.street != 'undefined' ? data.street : '',
        city: typeof data.city != 'undefined' ? data.city : '',
        landmark: typeof data.landmark != 'undefined' ? data.landmark : '',
        state: typeof data.state != 'undefined' ? data.state : '',
        pincode: typeof data.pincode != 'undefined' ? data.pincode : ''

      };
      return addresses;
    },
    RestApi: () => {
      app.post('/api/AWBNumberSeriesGeneration', (req, res)=>{
          var jsonData = {
            "BusinessUnit":"ECOM",
            "ServiceType":req.body.serviceType,
            "DeliveryType": req.body.deliveryType
          };
          _req({"url": ex.AWBNumberSeriesGeneration, 
                "json": true, 
                "method": "post",
                "body": jsonData,
                "headers": {
                  "Content-Type": "application/json",
                  "XBkey": ex.AccessFormat.XBkeyPost
                }}, (err, httpResponse, body)=>{

                if(typeof body.ReturnMessage != 'undefined' && body.ReturnMessage == 'Successful' 
                  && typeof body.ReturnCode != 'undefined' && body.ReturnCode == 100 && typeof body.BatchID != 'undefined'){
                  
                  var batches = {batchId: body.BatchID, servicetype: req.body.serviceType, deliverytype: req.body.deliveryType, _ia: 1};
                  db.collection('batches').insertOne(batches, (err, results)=>{
                    var jsonData = {
                      "BusinessUnit":"ECOM",
                      "ServiceType":req.body.serviceType,
                      "BatchID": body.BatchID.toString()
                    };
                    console.log("json data for get serial :::::: ", jsonData);
                    _req({"url": ex.GetAWBNumberGeneratedSeries, 
                      "json": true, 
                      "method": "post",
                      "body": jsonData,
                      "headers": {
                        "Content-Type": "application/json",
                        "XBkey": ex.AccessFormat.XBkeyGet
                      }}, (err, httpResponse, body)=>{
                          if(typeof body.ReturnMessage != 'undefined' && body.ReturnMessage == 'Successful'
                            && typeof body.ReturnCode != 'undefined' && body.ReturnCode == 100 
                            && typeof body.AWBNoSeries != 'undefined' && body.AWBNoSeries.length){
                              var awbnumbers = [];
                              for (var i = 0; i < body.AWBNoSeries.length; i++) {
                                awbnumbers.push({batchId:body.BatchID, awbnumber: body.AWBNoSeries[i]});
                              }
                              temp(awbnumbers, 0);
                              function temp(awbnumbers, i){
                                awbnumbers[i].id = i;
                                db.collection('awbnumbers').insertOne(awbnumbers[i], (err ,results)=>{
                                  if(typeof awbnumbers[++i] != 'undefined'){
                                    temp(awbnumbers, i);
                                  }else{
                                    res.send(body);
                                  }
                                })
                              }
                              
                            }else{
                              body.error = 'opration not done! for awb database!';
                              res.send(body);
                            }
                    })
                  })
                }else{
                  body.error = 'opration not done! for batch database!';
                  res.send(body);
                }
          })
      })
      app.get('/config', (req, res)=>{
          if(typeof req.query.authToken != 'undefined' && req.query.authToken == '56234tsdfe4524rwefsdt45234231'){
            var data = {'apiVersion': config.API_VERSION, androidVersion: config._av};
            res.send(data);
          }else{
            res.send(401);
          }
       })
      app.post('/api/'+config.API_VERSION+'/login', (req, res) => {
        console.log("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        console.log("req.body ::::::::::::::: ", req.body)
        if(typeof req.body.mobileno == 'undefined' && req.body.mobileno.trim() == ''){
          return res.send({error: 'Y', msg: 'data error', data: req.body});
        }
        db.collection('reseller').find({mobile1: req.body.mobileno}).toArray((err, results)=>{
          if(results.length){
            c("results ::::::::::::::: ", results)
            var fire = typeof results[0].firebaseToken != 'undefined' ? results[0].firebaseToken : '';
            db.collection('reseller').update({mobile1: req.body.mobileno}, {$set: {firebaseToken: typeof req.body.firebaseToken != 'undefined' ? req.body.firebaseToken : fire}}, (err, updateResults)=>{
              return res.send({error: 'N', msg: 'signup successfully saved!', resellerId: results[0]._id, name: results[0].name, profile: results[0].profile});
            })
          }else{
            var NewReseller = {
              name: '',
              firebaseToken: typeof req.body.firebaseToken != 'undefined' ? req.body.firebaseToken : '',
              profile: 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/img/snfl.png',
              mobile1: '',
              mobile2: '',
              email: '',
              cod: 0,
              cod_ratio: 0,
              created_at: new Date(),
              address: '',
              payable_margin: 0,
              paid_margin: 0
            };
            NewReseller.mobile1 = req.body.mobileno;
            db.collection('reseller').insertOne(NewReseller, (err, results)=>{
              if(!err){
                return res.send({error: 'N', msg: 'signup successfully saved!', resellerId: results.ops[0]._id, name: '', profile: ''});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/checkEmail', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.email == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.body});
        }
        db.collection('reseller').find({email: req.body.email}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: 'Available!', available: true});
          }else{
            return res.send({error: 'N', msg: 'Not Available!', available: false});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/checkAvailibility', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.pincode == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.body});
        }
        db.collection('pincode').find({pincode: req.body.pincode}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: 'Available!', available: true});
          }else{
            return res.send({error: 'N', msg: 'Not Available!', available: false});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/categories', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        db.collection('categories').find().toArray((err, results)=>{
          if(results.length){
            for (var i = 0; i < results.length; i++) {
              delete results[i]._id;
              results[i].id = results[i].catId;
              delete results[i].catId;
            }
            return res.send(results);
          }else{
            return res.send({error: 'Y', msg: 'no categories found!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/add_sender', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        var senderDetails = urlHandler.getSenderDetailsFormat(req.body);
        c("senderDetails ::::::::::::: ", senderDetails);
        db.collection('sender').insertOne(senderDetails, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'sender successfully saved!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/delete_sender/:senderId', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.params.senderId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.params});
        }
        db.collection('sender').remove({_id: new MongoId(req.params.senderId)}, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'Removed!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/update_sender/:senderId', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.params)
        var sender = {};
        if(typeof req.body.name != 'undefined' && req.body.name != ''){
          sender.name = req.body.name;
        }
        if(typeof req.body.phone_no != 'undefined' && req.body.phone_no != ''){
          sender.phone_no = req.body.phone_no;
        }
        if(!_.isEmpty(sender)){

          db.collection('sender').update({_id: new MongoId(req.params.senderId)}, {$set: sender}, (err, results)=>{
            if(!err){
              return res.send({error: 'N', msg: 'sender successfully updated!'});
            }else{
              return res.send({error: 'Y', msg: 'database error!', data: []});
            }
          })

        }else{
          return res.send({error: 'N', msg: 'data not found!'});
        }
      });

      app.get('/api/'+config.API_VERSION+'/sender_list', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('sender').find({resellerId: req.query.resellerId}).toArray((err, results)=>{
              if(results.length){
                for (var i = 0; i < results.length; i++) {
                  results[i].id = results[i]._id;
                  delete results[i]._id;
                }
                return res.send({error: 'N', msg: '', data: results, totalCount: results.length});
              }else{
                return res.send({error: 'Y', msg: 'data not found!', data: []});
              }
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })   
      });



      app.post('/api/'+config.API_VERSION+'/add_address', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        var addDetails = urlHandler.getAddressDetailsFormat(req.body);
        c("addDetails :::::::: ", addDetails);
        db.collection('addresses').insertOne(addDetails, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'address successfully saved!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/delete_address/:addressId', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.params.addressId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.params});
        }
        db.collection('addresses').remove({_id: new MongoId(req.params.addressId)}, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'Removed!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/update_address/:addressId', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        var address = {};
        if(typeof req.body.name != 'undefined'){
          address.name = req.body.name;
        }
        if(typeof req.body.phone_no != 'undefined' && req.body.phone_no != ''){
          address.phone_no = req.body.phone_no;
        }
        if(typeof req.body.building != 'undefined' && req.body.building != ''){
          address.building = req.body.building;
        }
        if(typeof req.body.street != 'undefined' && req.body.street != ''){
          address.street = req.body.street;
        }
        if(typeof req.body.city != 'undefined' && req.body.city != ''){
          address.city = req.body.city;
        }
        if(typeof req.body.landmark != 'undefined' && req.body.landmark != ''){
          address.landmark = req.body.landmark;
        }
        if(typeof req.body.state != 'undefined' && req.body.state != ''){
          address.state = req.body.state;
        }
        if(typeof req.body.pincode != 'undefined' && req.body.pincode != ''){
          address.pincode = req.body.pincode;
        }
        if(!_.isEmpty(address)){

          db.collection('addresses').update({_id: new MongoId(req.params.addressId)}, {$set: address}, (err, results)=>{
            if(!err){
              return res.send({error: 'N', msg: 'address successfully updated!'});
            }else{
              return res.send({error: 'Y', msg: 'database error!', data: []});
            }
          })

        }else{
          return res.send({error: 'N', msg: 'data not found!'});
        }
      });

      app.get('/api/'+config.API_VERSION+'/address_list', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.query)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('addresses').find({resellerId: req.query.resellerId}).toArray((err, results)=>{
              if(results.length){
                for (var i = 0; i < results.length; i++) {
                  results[i].id = results[i]._id;
                  delete results[i]._id;
                }
                return res.send({error: 'N', msg: '', data: results, totalCount: results.length});
              }else{
                return res.send({error: 'Y', msg: 'data not found!', data: []});
              }
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })   
      });



      app.post('/api/'+config.API_VERSION+'/addShareCatalog', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.catalogId == 'undefined' || typeof req.body.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        var addShareCatalog = {
          catalogId: typeof req.body.catalogId != 'undefined' ? req.body.catalogId : '',
          resellerId: typeof req.body.resellerId != 'undefined' ? req.body.resellerId : ''
        };
        db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('sharecatalog').insertOne(addShareCatalog, (err, results)=>{
              if(!err){
                return res.send({error: 'N', msg: 'catalog successfully saved!'});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
           }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        }) 
      });

      app.post('/api/'+config.API_VERSION+'/ShareCataloglist', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        if(typeof req.body.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.body}); 
        }
        db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            var addShareCatalog = [
               {$match: {resellerId: req.body.resellerId}},
               {
                 $lookup:
                   {
                     from: "catalogs",
                     localField: "catalogId",
                     foreignField: "catalogID",
                     as: "inventory_docs"
                   }
                },
                {
                    $unwind: "$inventory_docs"
                },
                {
                    $lookup:{
                        from: "categories", 
                        localField: "catId", 
                        foreignField: "categoriesId",
                        as: "user_role"
                    }
                },
                {   $unwind:"$user_role" },
                {
                    $group:{
                         _id : '$catalogId',
                        catalogId: {$last: '$catalogId'},
                        resellerId: {$last: '$resellerId'},
                        categoriesId: {$last: '$inventory_docs.categoriesId'},
                        categoriesName: {$last: '$user_role.name'},
                        catalogName: {$last: '$inventory_docs.name'},
                        description: {$last: '$inventory_docs.description'},
                        notes: {$last: '$inventory_docs.notes'},
                        price: {$last: '$inventory_docs.price'},
                        }
                }
                
            ];
            db.collection('sharecatalog').aggregate(addShareCatalog).toArray((err, results)=>{
              if(!err){
                if(results.length){
                  
                  function temp(results, arr, i, done){
                    db.collection('products').find({catalogId: results[i].catalogId}).toArray((err ,resultsProduct)=>{
                      if(resultsProduct.length){
                        db.collection('products').count({catalogId: results[i].catalogId}, (err ,totalProductCount)=>{
                          db.collection('products').findOne({catalogId: results[i].catalogId}, {discount_price: 1}, (err ,ProductPrice)=>{
                            db.collection('products').find({catalogId: results[i].catalogId}).limit(10).toArray((err ,resultsProduct)=>{
                              if(resultsProduct.length){
                                var temper  = {catalogId: results[i].catalogId, catalogName: results[i].catalogName, catalogDescription: results[i].description, images: [], total_product: totalProductCount, price: typeof ProductPrice.discount_price != 'undefined' ? ProductPrice.discount_price  : ProductPrice.price, categoriesName: results[i].categoriesName};
                                for(var j=0; j< resultsProduct.length; j++){
                                  if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != '' && resultsProduct[j]['product_image'] != null){
                                    temper.images.push(config.HOST+':'+port+'/'+resultsProduct[j]['product_image']);
                                  }
                                }
                                temper.totalProductImageCount = temper.images.length;
                                if(temper.images.length){
                                  arr.push(temper);
                                }
                                if(typeof results[++i] != 'undefined'){
                                  temp(results, arr, i, done);
                                }else{
                                  
                                  return done({error: 'N', 'data': arr, msg: '', totalCount: results.length});
                                }
                              }else{
                                return done({error: 'N', 'data': arr, msg: '', totalCount: results.length});
                              }
                            })
                          })
                        })
                      }else{
                        return done({error: 'N', 'data': arr, msg: '', totalCount: results.length});
                      }
                    })
                  }

                  temp(results, [], 0, (done)=>{
                    
                    res.send(done);
                  });
                }else{
                  c("this.refs. error :::::::: ");
                  return res.send({error: 'N', msg: 'results not found!', data: []});
                }
              }else{
                c("database error :::::::: ");
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        }) 
      });

      app.get('/api/'+config.API_VERSION+'/myProfile', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: '', data: results[0]});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/updateMyProfile', (req, res)=>{
        c("updateMyProfile :::::::::::");
        files.resellerUpload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.send({error: 'Y', msg: e.code});
          } else if (err) {
            // An unknown error occurred when uploading.
            res.send({error: 'Y', msg: e.code});
          }
          if(typeof req.body.resellerId == 'undefined'){
            return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
          }
          c("req.body ::::: ", req.body);
          if(typeof req.file != 'undefined' && typeof req.file.filename != 'undefined'){
            var resellerData = {
              profile: config.HOST+':'+port+'/public/reseller/'+req.file.filename
            };
          }else{
            resellerData = {};
          }

          if(typeof req.body.name != 'undefined'){
            resellerData.name = req.body.name;
          }
          if(typeof req.body.address != 'undefined'){
            resellerData.address = req.body.address;
          }
          if(typeof req.body.email != 'undefined'){
            resellerData.email = req.body.email;
          }
          if(typeof req.body.password != 'undefined'){
            resellerData.password = req.body.password;
          }
          if(typeof req.body.mobile1 != 'undefined'){
            resellerData.mobile1 = req.body.mobile1;
          }
          if(typeof req.body.mobile2 != 'undefined'){
            resellerData.mobile2 = req.body.mobile2;
          }
          db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, results)=>{
            if(results.length){
              db.collection('reseller').update({_id: new MongoId(req.body.resellerId)}, {$set: resellerData}, (err, results)=>{
                res.send({error: 'N', 'msg': 'resellerData successfully added!', data: resellerData});
              })
            }else{
              res.send({error: 'Y', 'msg': 'reseller not found!', data: resellerData});
            }
          })
        })
      });

      app.get('/api/'+config.API_VERSION+'/categories_list', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        db.collection('categories').count({}, (err ,categoriesCounts)=>{
          db.collection('categories').find({}).toArray((err ,categoriesResults)=>{
            if(categoriesResults.length){
              
              function temp(categoriesResults, i, done){
                db.collection('catalogs').count({categoriesId: categoriesResults[i].catId}, (err, catalogCount)=>{
                  db.collection('catalogs').find({categoriesId: categoriesResults[i].catId}).toArray((err, catalogResults)=>{
                    var temper = [];
                    for (var j = 0; j < catalogResults.length; j++) {
                      temper.push(catalogResults[j].catalogID);
                    }
                    categoriesResults[i].catalogCount = catalogCount;
                    categoriesResults[i].catalogs = temper;
                    if(typeof categoriesResults[++i] != 'undefined'){
                      temp(categoriesResults, i, done);
                    }else{
                      return done(categoriesResults);
                    }
                  })
                })
              }

              temp(categoriesResults, 0, (done)=>{
                function tempProduct(done, i, finalcb){
                  db.collection('products').count({catalogId: {$in: done[i].catalogs}}, (err, results)=>{
                    done[i].productCount = results;
                    done[i].categoriesId = done[i].catId;
                    done[i].categoriesName = done[i].name;
                    done[i].categoriesImage = done[i].categories_image;
                    delete done[i].catalogs;
                    delete done[i].catId;
                    delete done[i]._id;
                    delete done[i].name;
                    delete done[i].categories_image;
                    if(typeof done[++i] != 'undefined'){
                      tempProduct(done, i, finalcb);
                    }else{
                      return finalcb(done);
                    }
                  })
                }
                tempProduct(done, 0, (sure)=>{
                  return res.send({error: 'N', 'data': sure, msg: '', totalCount: sure.length});
                })
              })
              
            }else{
              return res.send({error: 'N', msg: 'categories not available', data: []});
            }
          })
        })
      })
      
     /* app.post('/api/'+config.API_VERSION+'/singleOrderDetails', (req, res) => {
       c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined' || typeof req.query.orderid == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        db.collection('orderplace').find({resellerId: req.query.resellerId, _id: new MongoId(eq.query.orderid)}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: '', data: results[0]});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });*/

      app.get('/api/'+config.API_VERSION+'/orderplace_list', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        if(typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }

        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'data error', data: req.query}); 
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('orderplace').count({resellerId: req.query.resellerId}, (err, orderCounts)=>{
              db.collection('orderplace').find({resellerId: req.query.resellerId}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, results)=>{
                if(results.length){
                  for (var i = 0; i < results.length; i++) {
                    results[i]['created_at'] = _date(results[i]['created_at']).format('DD MMMM, YYYY HH:mm A');
                    results[i]['updated_at'] = _date(results[i]['updated_at']).format('DD MMMM, YYYY HH:mm A');
                  }

                  function temp(results, i, done){
                    db.collection('orderproducts').find({orderno: results[i].orderno}).toArray((err, orderResults)=>{
                      if(!err){
                        for (var j = 0; j < orderResults.length; j++) {
                          orderResults[j].productImage = orderResults[j].image;
                          delete orderResults[j].image;
                        }
                        results[i].productDetails = orderResults;
                      }else{
                        results[i].productDetails = [];
                      }
                      if(typeof results[++i] != 'undefined'){
                        temp(results, i, done);
                      }else{
                        return done(results);
                      }
                    })
                  }
                  if(results.length){
                    temp(results, 0, (done)=>{
                      c("done ::::: ", done);
                      return res.send({error: 'N', 'data': done, msg: '', totalCount: results.length, totalOrdersCount: orderCounts});
                    })
                  }else{
                    return res.send({error: 'N', 'data': [], msg: '', totalCount: 0, totalOrdersCount: 0});
                  }

                }else{
                  return res.send({error: 'Y', msg: 'order not found!', data: []});
                }
              })
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        }) 
      });

     /* app.post('/api/'+config.API_VERSION+'/order_list', (req, res) => {
       c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query}); 
        }


        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: '', data: results[0]});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });*/

      app.post('/api/'+config.API_VERSION+'/uploadImpsRequest', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        files.impsUpload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          } else if (err) {
            // An unknown error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          }
          c("uploadImpsRequest ::::::::::::::::::: ", req.body)
          if(typeof req.file != 'undefined' && typeof req.file.filename != 'undefined'){
            if(typeof req.body.resellerId == 'undefined' || typeof req.body.accountname == 'undefined' || typeof req.body.accountno == 'undefined' || typeof req.body.bankname == 'undefined' || typeof req.body.ifsc == 'undefined'){
              return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
            }
            db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, resellerResults)=>{
              if(resellerResults.length){
                var IMPS = {
                  resellerId: req.body.resellerId,
                  image: config.HOST+':'+port+'/public/imps/'+req.file.filename,
                  bankname: req.body.bankname,
                  accountno: req.body.accountno,
                  accountname: req.body.accountname,
                  ifsc: req.body.ifsc
                };
                db.collection('resellerimps').insertOne(IMPS, (err, results)=>{
                  if(!err){
                    res.send({error: 'N', 'msg': 'IMPS successfully added!', image: IMPS.image, id: results.ops[0]._id});
                  }else{
                    return res.send({error: 'Y', msg: 'database error!', data: []});
                  }
                })
              }else{
                return res.send({error: 'Y', msg: 'data not available!', data: []});
              }
            }) 
          }else{
            console.log("FIle Not Uploaded !");
            return res.send({error: 'Y', msg: ' uploadImpsRequest image uploading Error'});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/addBankDetails', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        files.bankUpload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          } else if (err) {
            // An unknown error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          }
          c("BankDetails ::::::::::::::::::: ", req.body)
          if(typeof req.file != 'undefined' && typeof req.file.filename != 'undefined'){
            db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, resellerResults)=>{
              if(resellerResults.length){
                var BankDetails = {
                  resellerId: typeof req.body.resellerId != 'undefined' ? req.body.resellerId : '',
                  bankname: typeof req.body.bankname != 'undefined' ? req.body.bankname : '',
                  accountno: typeof req.body.accountno != 'undefined' ? req.body.accountno : '',
                  accountname: typeof req.body.accountname != 'undefined' ? req.body.accountname : '',
                  ifsc: typeof req.body.ifsc != 'undefined' ? req.body.ifsc : '',
                  image: config.HOST+':'+port+'/public/bank/'+req.file.filename
                };
                db.collection('bankdetails').insertOne(BankDetails, (err, results)=>{
                  if(!err){
                    res.send({error: 'N', 'msg': 'BankDetails successfully added!', data: BankDetails});
                  }else{
                    return res.send({error: 'Y', msg: 'database error!', data: []});
                  }
                })
              }else{
                return res.send({error: 'Y', msg: 'data not available!', data: []});
              }
            }) 
          }else{
            console.log("FIle Not Uploaded !");
            return res.send({error: 'Y', msg: ' addBankDetails image uploading Error'});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/uploadBankRequest', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        files.bankUpload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          } else if (err) {
            // An unknown error occurred when uploading.
            c("err ::::::::::: ", err)
            return res.send({error: 'Y', msg: err.code});
          }
          c("uploadBankRequest ::::::::::::::::::: ", req.body)
          if(typeof req.body.bankId == 'undefined'){
            return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
          }
          if(typeof req.file != 'undefined' && typeof req.file.filename != 'undefined'){
            if(typeof req.body.bankId == 'undefined'){
              return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
            }
            var BankDetails = {image: config.HOST+':'+port+'/public/bank/'+req.file.filename};
          }else{
            var BankDetails = {};
          }
          if(typeof req.body.bankname != 'undefined'){
            BankDetails.bankname = req.body.bankname;
          }
          if(typeof req.body.accountno != 'undefined'){
            BankDetails.accountno = req.body.accountno;
          }
          if(typeof req.body.accountname != 'undefined'){
            BankDetails.accountname = req.body.accountname;
          }
          if(typeof req.body.ifsc != 'undefined'){
            BankDetails.ifsc = req.body.ifsc;
          }

          if(!_.isEmpty(BankDetails)){
            db.collection('bankdetails').update({_id: new MongoId(req.body.bankId)}, {$set: BankDetails}, (err, results)=>{
              if(!err){
                res.send({error: 'N', 'msg': 'Bank Request successfully Updated!', data: BankDetails});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }else{
            return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/BankDetailslist', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path, req.query)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }  
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('bankdetails').find({resellerId: req.query.resellerId}).toArray((err, results)=>{
              if(results.length){
                results[0].id = results[0]._id;
                delete results[0]._id;
                c("results :::::::::::: ", results);
                return res.send({error: 'N', msg: '', data: results[0]});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: {}});
              }
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })   
      });

      app.post('/api/'+config.API_VERSION+'/placeOrder', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        c("req ::::::: ", req.body);
        if(typeof req.body.resellerId == 'undefined' || typeof req.body.addressId == 'undefined' 
          || typeof req.body.senderId == 'undefined' || typeof req.body.paymentMethod == 'undefined'
          || typeof req.body.totalAmount == 'undefined'
          || typeof req.body.finalCollect == 'undefined'
          || typeof req.body.totalPrice == 'undefined' || typeof req.body.shippingCharge == 'undefined'
          || typeof req.body.cod == 'undefined' || req.body.discount == 'undefined'
          || typeof req.body.totalItemCount == 'undefined' || req.body.suppliername == 'undefined'
          ){

          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, resellerResults)=>{
          db.collection('orderplace').find({}).limit(1).sort({created_at: -1}).toArray((err, orderResultss)=>{

            if(resellerResults.length){
              var mobileno = '';
              if(typeof resellerResults[0].mobile1 != 'undefined'){
                mobileno = resellerResults[0].mobile1;
              }
              if(typeof resellerResults[0].mobile2 != 'undefined' && resellerResults[0].mobile2 != ''){
                if(mobileno == ''){
                  mobileno = resellerResults[0].mobile2;
                }
              }
              var orderplace = {
                orderno: orderResultss.length ? orderResultss[0].orderno+1 : 1000,
                resellerId: typeof req.body.resellerId != 'undefined' ? req.body.resellerId : '',
                mobileno: mobileno,
                addressId: typeof req.body.addressId != 'undefined' ? req.body.addressId : '',
                senderId: typeof req.body.senderId != 'undefined' ? req.body.senderId : '',
                paymentMethod: typeof req.body.paymentMethod != 'undefined' ? req.body.paymentMethod : '',
                imps: typeof req.body.imps != 'undefined' ? req.body.imps : 0,
                transactionId: typeof req.body.transactionId != 'undefined' ? req.body.transactionId : '',
                totalAmount: typeof req.body.totalAmount != 'undefined' ? parseInt(req.body.totalAmount) : 0,
                totalPrice: typeof req.body.totalPrice != 'undefined' ? parseFloat(req.body.totalPrice) : 0,
                cod: typeof req.body.cod != 'undefined' ? req.body.cod : 0,
                totalItemCount: typeof req.body.totalItemCount != 'undefined' ? req.body.totalItemCount : 0,
                shippingCharge: typeof req.body.shippingCharge != 'undefined' ? req.body.shippingCharge : 0,
                discount: typeof req.body.discount != 'undefined' ? parseInt(req.body.discount) : 0,
                suppliername: typeof req.body.suppliername != 'undefined' ? req.body.suppliername : 0,
                finalCollect: typeof req.body.finalCollect != 'undefined' ? parseInt(req.body.finalCollect) : 0,
                margin: (parseInt(req.body.finalCollect) >= parseInt(req.body.totalAmount)) ? Math.round(parseInt(req.body.finalCollect) - parseInt(req.body.totalAmount)) : 0,
                address: '',
                senderDetails: '',
                status: 0,
                date: _date().format('YYYY-MM-DD'),
                created_at: new Date()
              };

              var productDetails = [];
              var cartIdList = [];
              req.body.productDetails = JSON.parse(req.body.productDetails);
              /*for (var i = 0; i < req.body.productDetails.length; i++) {

                var orderno = orderplace.orderno;
                var productId = req.body.productDetails[i].id;
                var ProductName = typeof req.body.productDetails[i].ProductName != 'undefined' ? req.body.productDetails[i].ProductName : '';
                var qty = typeof req.body.productDetails[i].qty != 'undefined' ? req.body.productDetails[i].qty : 0;
                var size = typeof req.body.productDetails[i].size != 'undefined' ? req.body.productDetails[i].size : '';
                var weight = typeof req.body.productDetails[i].weight != 'undefined' ? req.body.productDetails[i].weight : '';
                var image = typeof req.body.productDetails[i].image != 'undefined' ? req.body.productDetails[i].image : '';
                var pricePerProduct = typeof req.body.productDetails[i].pricePerProduct != 'undefined' ? req.body.productDetails[i].pricePerProduct : 0;
                var cartId = typeof req.body.productDetails[i].cartId != 'undefined' ? req.body.productDetails[i].cartId : 0;
                
                orderplace.totalItemCount += parseInt(qty);
                
                var temp = {orderno: orderno, ProductName: ProductName, qty:qty, size:size,
                 weight:weight, image:image, pricePerProduct:pricePerProduct, productId:productId, cartId:cartId, created_at: new Date()};
                productDetails.push(temp);
                if(cartId != 0 && !common.InArray(cartId, cartIdList)){
                  cartIdList.push(new MongoId(cartId));
                }
              }*/
             
              db.collection('addresses').find({_id: new MongoId(orderplace.addressId)}).toArray((err, results)=>{
                if(results.length){
                  if(typeof results[0]['name'] != 'undefined'){
                    orderplace.address += results[0]['name'];
                  }
                  if(typeof results[0]['building'] != 'undefined'){
                    orderplace.address += ', '+results[0]['building'];
                  }
                  if(typeof results[0]['street'] != 'undefined'){
                    orderplace.address += ', '+results[0]['street'];
                  }
                  if(typeof results[0]['city'] != 'undefined'){
                    orderplace.address += ', '+results[0]['city'];
                  }
                  if(typeof results[0]['landmark'] != 'undefined'){
                    orderplace.address += ', '+results[0]['landmark'];
                  }
                  if(typeof results[0]['state'] != 'undefined'){
                    orderplace.address += ', '+results[0]['state'];
                  }
                  if(typeof results[0]['pincode'] != 'undefined'){
                    orderplace.address += ', '+results[0]['pincode'];
                  }
                  if(typeof results[0]['phone_no'] != 'undefined'){
                    orderplace.address += ', '+results[0]['phone_no'];
                  }

                  
                   db.collection('sender').find({_id: new MongoId(orderplace.senderId)}).toArray((err, results)=>{
                    if(results.length){
                      if(typeof results[0]['name'] != 'undefined'){
                        orderplace.senderDetails += results[0]['name'];
                      }
                      if(typeof results[0]['phone_no'] != 'undefined'){
                        orderplace.senderDetails += ', '+results[0]['phone_no'];
                      }

                      function tt(productDetails, orderplace, temper, cartIdList, i, dn){
                        if(productDetails.length && typeof productDetails[i].id != 'undefined'){
                          db.collection('products').find({productId: productDetails[i].id}).toArray((err, productResults)=>{
                            
                            var orderno = orderplace.orderno;
                            var productId = productDetails[i].id;
                            var ProductName = typeof productDetails[i].ProductName != 'undefined' ? productDetails[i].ProductName : '';
                            var qty = typeof productDetails[i].qty != 'undefined' ? productDetails[i].qty : 0;
                            var size = typeof productDetails[i].size != 'undefined' ? productDetails[i].size : '';
                            var weight = typeof productDetails[i].weight != 'undefined' ? productDetails[i].weight : '';
                            var image = typeof productDetails[i].image != 'undefined' ? productDetails[i].image : '';
                            var pricePerProduct = typeof productDetails[i].pricePerProduct != 'undefined' ? productDetails[i].pricePerProduct : 0;
                            var cartId = typeof productDetails[i].cartId != 'undefined' ? productDetails[i].cartId : 0;
                            
                            orderplace.totalItemCount += parseInt(qty);
                            var temp = {orderno: orderno, ProductName: ProductName, qty:qty, size:size,
                             weight:weight, image:image, totalAmount: parseFloat(orderplace.totalAmount), pricePerProduct:pricePerProduct, productId:productId, cartId:cartId, created_at: new Date(), vendorId: ''};

                            if(cartId != 0 && !common.InArray(cartId, cartIdList)){
                              cartIdList.push(new MongoId(cartId));
                            }

                            if(productResults.length){
                              db.collection('catalogs').find({catalogID: productResults[0].catalogId}).toArray((err, catalogResults)=>{
                                if(catalogResults.length){
                                  temp.vendorId = typeof catalogResults[0].vendorId != 'undefined' ? new MongoId(catalogResults[0].vendorId) : '';
                                  orderplace.vendorId = typeof catalogResults[0].vendorId != 'undefined' ? new MongoId(catalogResults[0].vendorId) : '';
                                }  
                                temper.push(temp);
                                if(typeof productDetails[++i] != 'undefined'){
                                  tt(productDetails, orderplace, temper, cartIdList, i, dn);
                                }else{
                                  return dn(temper, orderplace, cartIdList);
                                }

                              })
                            }else{
                              temper.push(temp);
                              if(typeof productDetails[++i] != 'undefined'){
                                tt(productDetails, orderplace, temper, cartIdList, i, dn);
                              }else{
                                return dn(temper, orderplace, cartIdList);
                              } 
                            } 
                          })
                        }else{
                          return dn(temper, orderplace, cartIdList);
                        }
                      }
                      tt(req.body.productDetails, orderplace, [], [], 0, (products, orderplace, removeableCarts)=>{
                        db.collection('orderplace').insertOne(orderplace, (err, results)=>{
                          if(err){
                            c("error orderproducts ::::::: ", err);
                            return res.send({error: 'Y', msg: 'database error!', data: err});
                          }else{
                            console.log("products ::::::::: ", products);
                            db.collection('orderproducts').insertMany(products, (err, orderresults)=>{
                              c("err ::::::::::::::::::::::::: ", err);
                              c("orderresults ::::::::::::::::::::::::: ", products);
                              if(removeableCarts.length){
                                db.collection('cart').remove({_id: {$in: removeableCarts}}, (err, cardresults)=>{
                                  db.collection('reseller').update({_id: new MongoId(req.body.resellerId)}, {$inc: {payable_margin: orderplace.margin}}, (err, userresults)=>{
                                    return res.send({error: 'N', msg: 'order place successfully saved!', orderid: results.ops[0]._id});  
                                  })
                                })
                              }else{
                                return res.send({error: 'N', msg: 'order place successfully saved!', orderid: results.ops[0]._id});
                              }
                            })
                            
                          }
                        })
                      })
                    }else{
                      return res.send({error: 'Y', msg: 'sender not available to database!', data: []});
                    }
                  })
                }else{
                  return res.send({error: 'Y', msg: 'database error!', data: []});
                }
              })
            }else{
              return res.send({error: 'Y', msg: 'data not available!', data: []});
            }
          })  
        }) 
      });

      
      app.get('/api/'+config.API_VERSION+'/total_product_purchase', (req, res)=>{
        c("appp ::::::::::::::::::: ", req.path)

        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, resellerResults)=>{
          if(resellerResults.length){
            db.collection('config').find({id: 1}).toArray((err, configs)=>{
              db.collection('cart').find({resellerId: req.query.resellerId}).toArray((err, results)=>{
                if(results.length){
                  var products = [];
                  for (var i = 0; i < results.length; i++) {
                    products.push(results[i].productId);
                    results[i].cartId = results[i]._id;
                  }
                  function temp(results, shipingCharges, totalWeight, discount_price, i , done){
                    db.collection('products').find({productId: results[i].productId}).toArray((err, productResults)=>{
                      if(productResults.length){
                        results[i].productName = productResults[0].name;
                        results[i].productPrice = typeof productResults[0].discount_price != 'undefined' ? productResults[0].discount_price  : productResults[0].price;
                        results[i].productImage = config.HOST+':'+port+'/'+productResults[0].product_image;
                        results[i].productDescription = productResults[0].description;
                        results[i].productSize = productResults[0].size.toString().split(', ')[0];
                        results[i].weight = productResults[0].weight;
                        totalWeight += parseInt(productResults[0].weight);
                        var shipingCharge=80;
                        for (var poductWight=parseFloat(productResults[0].weight);poductWight>1.0 ;poductWight=poductWight-0.5) {
                            shipingCharge=shipingCharge+50;
                        }
                        shipingCharges += (shipingCharge)*parseInt(results[i].qty);
                        discount_price += parseInt(typeof productResults[0].discount_price != 'undefined' ? productResults[0].discount_price  : productResults[0].priceproductResults[0].discount_price) * parseInt(results[i].qty);
                      }else{
                        results[i].productName = '';
                        results[i].productPrice = '';
                        results[i].productImage = '';
                        results[i].productDescription = '';
                        results[i].productSize = '';
                        results[i].weight = '';
                      }
                      if(typeof results[++i] != 'undefined'){
                        temp(results, shipingCharges, totalWeight, discount_price, i, done);
                      }else{
                        return done({results: results, totalWeight: totalWeight, discount_price: discount_price, shipingCharges: shipingCharges});
                      }
                    })
                  }
                  temp(results, 0, 0, 0 ,0,(done)=>{
                    var cod = 0;
                    if(typeof configs[0]['cod'] != 'undefined' &&  configs[0]['cod']){
                      if(typeof resellerResults[0]['cod'] != 'undefined'){
                        cod = resellerResults[0]['cod'];
                      }
                    }
                    return res.send({error: 'N', 'data': {products: done.results, totalItem: results.length, totalPrice: done.discount_price,
                     shippingCharge: done.shipingCharges, 'cod': 50, discount: 0}, msg: '', totalCount: results.length, suppliername: 'Sun Fashion', cod: cod});
                  })
                }else{
                  return res.send({error: 'N', msg: 'product not available into cart', data: []});
                }
              })
            })
          }else{
            return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })
      });
      app.post('/api/'+config.API_VERSION+'/add_cart', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        if(typeof req.body.resellerId == 'undefined' || typeof req.body.productId == 'undefined' || typeof req.body.qty == 'undefined' || typeof req.body.size == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        var cart = {
          productId: req.body.productId,
          resellerId: req.body.resellerId,
          qty: parseInt(req.body.qty),
          size: req.body.size,
          createdat: new Date()
        };
        db.collection('products').find({productId: req.body.productId, qty: {$gte: parseInt(req.body.qty)}}).toArray((err, results)=>{
          if(results.length){
            db.collection('products').update({productId: req.body.productId}, {$inc: {qty: -parseInt(req.body.qty)}}, (err, results)=>{
              db.collection('reseller').find({_id: new MongoId(cart.resellerId)}).toArray((err, results)=>{
                if(results.length){
                  db.collection('cart').insertOne(cart, (err, results)=>{
                    if(!err){
                      return res.send({error: 'N', msg: 'item successfully added to cart!'});
                    }else{
                      return res.send({error: 'Y', msg: 'database error!', data: []});
                    }
                  })
                }else{
                  return res.send({error: 'Y', msg: 'data not available!', data: []});
                }
              })
            })
          }else{
            return res.send({error: 'Y', msg: 'product out of stock!', data: []});
          }
        })
      });
      app.post('/api/'+config.API_VERSION+'/qty_check', (req, res) => {
        console.log("req.body :::::: ", req.body);
        if(typeof req.body.productId == 'undefined' || typeof req.body.qty == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        db.collection('products').find({productId: req.body.productId, qty: {$gte: parseInt(req.body.qty)}}).toArray((err, results)=>{
          if(results.length){
            return res.send({error: 'N', msg: 'product stock available', available: true, stockLimit: results[0].qty});
          }else{
            return res.send({error: 'N', msg: 'product out of stock!', available: false, stockLimit: 0});
          }
        })
      })

      app.post('/api/'+config.API_VERSION+'/remove_cart', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        if(typeof req.body.id == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        db.collection('cart').remove({_id: new MongoId(req.body.id)}, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'item successfully removed from cart!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/cartCount', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, results)=>{
          if(results.length){
            db.collection('cart').count({resellerId: req.query.resellerId}, (err, results)=>{
              if(!err){
               return res.send({error: 'N', msg: '', totalCount: results});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }else{
          return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/cart_list', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, results)=>{
          if(results.length){
            db.collection('cart').find({resellerId: req.query.resellerId}).toArray((err, results)=>{
              if(!err){
                function temp(results, i ,done){
                  results[i].cartId = results[i]._id;
                  delete results[i]._id;
                  db.collection('products').find({productId: results[i].productId}).toArray((err, proresults)=>{
                    if(proresults.length){
                      results[i].productName = proresults[0].name;
                      results[i].productPrice = typeof proresults[0].discount_price != 'undefined' ? proresults[0].discount_price  : proresults[0].price;
                      results[i].productImage = config.HOST+':'+port+'/'+proresults[0].product_image;
                      results[i].productDescription = proresults[0].description;
                      results[i].productSize = proresults[0].size;
                      results[i].productQuantity = proresults[0].qty;
                    }else{
                      results[i].productName = '';
                      results[i].productPrice = '';
                      results[i].productImage = '';
                      results[i].productDescription = '';
                      results[i].productSize = '';
                      results[i].productQuantity = '';
                    }
                    if(typeof results[++i] != 'undefined'){
                      temp(results, i ,done);
                    }else{
                      return done(results);
                    }
                  })
                }
                if(results.length){
                  temp(results, 0, (done)=>{
                    c("results :::::::", results);
                    return res.send({error: 'N', 'data': done, msg: '', totalCount: done.length});
                  })
                }else{
                  return res.send({error: 'Y', msg: 'cart empty!', data: []});
                }
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }else{
          return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/add_review', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.rating == 'undefined' || typeof req.body.reviewerName == 'undefined' || typeof req.body.reviewerId == 'undefined' || typeof req.body.reviewText == 'undefined' || typeof req.body.productId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        var review = {
          rating: req.body.rating,
          reviewerName: req.body.reviewerName,
          reviewerId: req.body.reviewerId,
          reviewText: req.body.reviewText,
          productId: req.body.productId,
          reviewDate: new Date()
        };
        db.collection('review').insertOne(review, (err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: 'review successfully added!'});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/review_list', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.productId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});  
        }
        db.collection('review').find({productId: req.body.productId}).toArray((err, results)=>{
          if(!err){
            if(results.length){
              for (var i = 0; i < results.length; i++) {
                results[i].reviewDate = _date(results[i].reviewDate).format('DD MMMM, YYYY');

              }
              return res.send({error: 'N', 'data': results, msg: ''});
            }else{
              return res.send({error: 'N', msg: 'review not available', data: []});
            }
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/add_product_rate', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.resellerId == 'undefined' || typeof req.body.rate == 'undefined' || typeof req.body.catalogId == 'undefined'
         || typeof req.body.orderno == 'undefined' || typeof req.body.productId == 'undefined'){

          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});
        }
        db.collection('reseller').find({_id: new MongoId(req.body.resellerId)}).toArray((err, results)=>{
          if(results.length){
            var productrate = {
              resellerId: req.body.resellerId,
              rate: req.body.rate,
              review: req.body.review,
              catalogId: req.body.catalogId,
              orderno: parseInt(req.body.orderno),
              productId: req.body.productId
            };
            db.collection('productrate').insertOne(productrate, (err, results)=>{
              if(!err){
                return res.send({error: 'N', msg: 'product rate successfully added!'});
              }else{
                return res.send({error: 'Y', msg: 'database error!', data: []});
              }
            })
          }else{
          return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/catalog_product_list', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined' || typeof req.body.catalogId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        console.log("catalog_product_list ::::::::: ", req.body);
        db.collection('catalogs').find({catalogID: req.body.catalogId}).toArray((err, catalogResults)=>{
          if(!err){
            console.log("catalogResults :::::::::: ", catalogResults.length);
            if(catalogResults.length){
              db.collection('products').find({catalogId: req.body.catalogId, qty : {$gt: 0}}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, results)=>{
                db.collection('products').count({catalogId: req.body.catalogId, qty : {$gt: 0}}, (err, productCounts)=>{
                  if(results.length){
                    var temper = [];
                    for (var i = 0; i < results.length; i++) {
                      temper.push({});
                      temper[i]['name'] = results[i].name;
                      temper[i]['productId'] = results[i].productId;
                      temper[i]['productName'] = results[i].name;
                      temper[i]['discountPrice'] = typeof results[i].discount_price != 'undefined' ? results[i].discount_price  : results[i].price;
                      temper[i]['qty'] = results[i].qty;
                      temper[i]['productPrice'] = results[i].price;
                      temper[i]['discountPercentage'] = 0;
                      temper[i]['size'] = results[i].size;
                      temper[i]['weight'] = results[i].weight;
                      temper[i]['productDescription'] = results[i].description;

                      temper[i]['productSize'] = results[i]['size'].toString().split(', ');
                      temper[i]['productOldPrice'] = 0;
                      temper[i]['productImage'] = [];
                      
                      if(typeof results[i]['product_image'] != 'undefined' && results[i]['product_image'] != ''){
                        temper[i]['productImage'].push(config.HOST+':'+port+'/'+results[i]['product_image']);
                      }
                      if(typeof results[i]['product_image1'] != 'undefined' && results[i]['product_image1'] != ''){
                        temper[i]['productImage'].push(config.HOST+':'+port+'/'+results[i]['product_image1']);
                      }
                      if(typeof results[i]['product_image2'] != 'undefined' && results[i]['product_image2'] != ''){
                        temper[i]['productImage'].push(config.HOST+':'+port+'/'+results[i]['product_image2']);
                      }
                      if(typeof results[i]['product_image3'] != 'undefined' && results[i]['product_image3'] != ''){
                        temper[i]['productImage'].push(config.HOST+':'+port+'/'+results[i]['product_image3']);
                      }

                      temper[i]['productSize'] = results[i]['size'].toString().split(',');
                      temper[i]['ProductRating'] = [];
                      temper[i]['avgProductRating'] = 0;
                    }
                    function temp(temper, i , tempDone){
                      db.collection('review').find({productId: results[i].productId}).limit(2).toArray((err, results)=>{
                        temper[i].ProductRating = [];
                        if(!err){
                          temper[i].ProductRating = results;
                        }
                        if(typeof temper[++i] != 'undefined'){
                          temp(temper, i, tempDone);
                        }else{
                          return tempDone(temper);
                        }
                      })
                    }
                    temp(temper, 0, (temper)=>{
                      c("temper :::::::::::::: ", temper);
                      res.send({error: 'N', 'data': temper, msg: '', 'catalogDescription': catalogResults[0]['description'], 'totalCount': temper.length,'totalProductCount': productCounts});
                    })
                  }else{
                    c('product not ava');
                    return res.send({error: 'N', msg: 'products not available', data: []});
                  }
                })
              })
            }else{
              c('catalogs not ava');
              return res.send({error: 'N', msg: 'catalogs not available', data: []});
            }
          }else{
            c('database error not ava');
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/getProductImages', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path, req.query, req.body)
        if(typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined' || typeof req.body.catalogId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        db.collection('catalogs').find({catalogID: req.body.catalogId}).toArray((err, results)=>{
          if(results.length){
            db.collection('products').find({catalogId: req.body.catalogId}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, results)=>{
              db.collection('products').count({catalogId: req.body.catalogId}, (err, productCounts)=>{
                if(productCounts){
                  var arr = [];
                  if(results.length){
                    for (var i = 0; i < results.length; i++) {
                      arr.push(config.HOST+':'+port+'/'+results[i].product_image);
                    }
                  }
                 return res.send({error: 'N', 'data': {url: config.HOST+':'+port+'/public/products/', 'images': arr}, msg: '', totalCount: arr.length, totalProductImageCount: productCounts});
                }else{
                  c("products not available :::::: ")
                  return res.send({error: 'Y', msg: 'products not available', data: []});
                }
              })
            })
          }else{
            c("catalogs not available :::::: ")
            return res.send({error: 'Y', msg: 'catalogs not available', data: []});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/sliderImagesList', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        db.collection('banner').find({}).limit(3).toArray((err, results)=>{
          if(!err){
            return res.send({error: 'N', msg: '', data: results});
          }else{
            return res.send({error: 'Y', msg: 'database error!', data: []});
          }
        })
      });
      
      app.post('/api/'+config.API_VERSION+'/filterData', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.start == 'undefined' || typeof req.body.end == 'undefined' || typeof req.body.filter == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});  
        }
        var catalogs = req.body.filter.split('#');
        if(typeof catalogs[0] != 'undefined' && catalogs[0] == 'catalog'){
           var aggregated = [{$match: {catalogID: req.body.filter}},
            {
                $lookup:{
                    from: "categories", 
                    localField: "catId", 
                    foreignField: "categoriesId",
                    as: "user_role"
                }
            },
            {   $unwind:"$user_role" },
            {   
                $project:{
                    _id : 1,
                    catalogId : 1,
                    resellerId : 1,
                    categoriesId : "$categoriesId",
                    categoriesName : "$user_role.name",
                    catalogName : "$name",
                    description : "$description",
                    notes : "$notes",
                    price : "$price"
                } 
            },
            {$limit: 1}];

            db.collection('catalogs').aggregate(aggregated).toArray((err, aggreResults)=>{
              if(!err){
                if(aggreResults.length){
                  db.collection('products').find({catalogId: catalogs[1]}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, resultsProduct)=>{
                    db.collection('products').count({catalogId: catalogs[1]}, (err, productCounts)=>{
                      db.collection('products').find({catalogId: catalogs[1]}).limit(1).sort({discount_price: 1}).toArray((err, productPrice)=>{
                        if(productCounts){
                          var temper  = {catalogId: aggreResults[0].catalogID, catalogName: aggreResults[0].catalogName, products: [], total_product: productCounts, price: productPrice[0]['discount_price'], categoriesName: aggreResults[0].categoriesName};
                          if(resultsProduct.length){
                            for (var j = 0; j < resultsProduct.length; j++) {
                              var temper1  = {
                                      rating: 4,
                                      productId: typeof resultsProduct[j]['productId'] != 'undefined' ? resultsProduct[j]['productId'] : '',
                                      images: [],
                                      productName: typeof resultsProduct[j]['name'] != 'undefined' ? resultsProduct[j]['name'] : '',
                                      description: typeof resultsProduct[j]['description'] != 'undefined' ? resultsProduct[j]['description'] : '', 
                                      price: typeof resultsProduct[j]['price'] != 'undefined' ? resultsProduct[j]['price'] : '',
                                      discount_price: typeof resultsProduct[j]['discount_price'] != 'undefined' ? resultsProduct[j]['discount_price'] : '',
                                      discount_pre: typeof resultsProduct[j]['discount_pre'] != 'undefined' ? resultsProduct[j]['discount_pre'] : '',
                                      size: typeof resultsProduct[j]['size'] != 'undefined' ? resultsProduct[j]['size'].split(',') : '',
                                      qty: typeof resultsProduct[j]['qty'] != 'undefined' ? resultsProduct[j]['qty'] : ''
                                    };
                        
                                if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != ''){
                                  temper1.images.push(resultsProduct[j]['product_image']);
                                }
                                if(typeof resultsProduct[j]['product_image1'] != 'undefined' && resultsProduct[j]['product_image1'] != ''){
                                  temper1.images.push(resultsProduct[j]['product_image1']);
                                }
                                if(typeof resultsProduct[j]['product_image2'] != 'undefined' && resultsProduct[j]['product_image2'] != ''){
                                  temper1.images.push(resultsProduct[j]['product_image2']);
                                }
                                if(typeof resultsProduct[j]['product_image3'] != 'undefined' && resultsProduct[j]['product_image3'] != ''){
                                  temper1.images.push(resultsProduct[j]['product_image3']);
                                }
                              temper.products.push(temper1);
                            }
                            res.send({error: 'N', 'data': temper, msg: '', totalCount: productCounts, screen: 'catalogSeach'});
                          }
                         
                        }else{
                          return res.send({error: 'N', msg: 'product not available as per catalog id', data: []});
                        }
                      })
                    })
                  })
                }else{
                  return res.send({error: 'N', msg: 'product not available as per catalog id', data: []});
                }
              }
            })

        }else if(typeof catalogs[0] != 'undefined' && catalogs[0] == 'product'){
          db.collection('products').find({productId: req.body.filter}).limit(1).toArray((err, results)=>{
            if(results.length){
               var temper  = {
                              rating: 5,
                              images: [],
                              productName: typeof resultsProduct[0]['name'] != 'undefined' ? resultsProduct[0]['name'] : '',
                              description: typeof resultsProduct[0]['description'] != 'undefined' ? resultsProduct[0]['description'] : '', 
                              price: typeof resultsProduct[0]['price'] != 'undefined' ? resultsProduct[0]['price'] : '',
                              discount_price: typeof resultsProduct[0]['discount_price'] != 'undefined' ? resultsProduct[0]['discount_price'] : '',
                              discount_pre: typeof resultsProduct[0]['discount_pre'] != 'undefined' ? resultsProduct[0]['discount_pre'] : '',
                              size: typeof resultsProduct[0]['size'] != 'undefined' ? resultsProduct[0]['size'].split(',') : '',
                              qty: typeof resultsProduct[0]['qty'] != 'undefined' ? resultsProduct[0]['qty'] : ''
                            };
                
                if(typeof resultsProduct[0]['product_image'] != 'undefined' && resultsProduct[0]['product_image'] != ''){
                  temper.images.push(config.HOST+':'+port+'/'+resultsProduct[0]['product_image']);
                }
                if(typeof resultsProduct[0]['product_image1'] != 'undefined' && resultsProduct[0]['product_image1'] != ''){
                  temper.images.push(config.HOST+':'+port+'/'+resultsProduct[0]['product_image1']);
                }
                if(typeof resultsProduct[0]['product_image2'] != 'undefined' && resultsProduct[0]['product_image2'] != ''){
                  temper.images.push(config.HOST+':'+port+'/'+resultsProduct[0]['product_image2']);
                }
                if(typeof resultsProduct[0]['product_image3'] != 'undefined' && resultsProduct[0]['product_image3'] != ''){
                  temper.images.push(config.HOST+':'+port+'/'+resultsProduct[0]['product_image3']);
                }

                res.send({error: 'N', 'data': temper, msg: '', screen: 'productSearch'});
            }else{
              return res.send({error: 'N', msg: 'product not available as per catalog id', data: []});
            }
          })
        }else{
          var aggregated = [
            {$match: {name: { $regex: req.body.filter, $options: 'i'}}},
            {
                $lookup:{
                    from: "categories", 
                    localField: "cat_id", 
                    foreignField: "categoriesId",
                    as: "user_role"
                }
            },
            {   $unwind:"$user_role" },
            {
                $group : {
                  _id : '$catalogID',
                  catalogId: { $last: "$catalogID" },
                  catalogName: { $last: "$name" },
                  categoriesName: { $last: "$user_role.name" },
                  categoriesId: { $last: "$user_role.catId" },
                  count: { $sum: 1 }
                }
              },
              {$skip: parseInt(req.body.start)},
              {$limit: parseInt(req.body.end)}
            
            ];
          db.collection('catalogs').aggregate(aggregated).toArray((err, results)=>{
            if(results.length){
              function temp(results, arr, i, done){
                db.collection('products').find({catalogId: results[i].catalogId}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, resultsProduct)=>{
                  db.collection('products').count({catalogId: results[i].catalogId}, (err, productCounts)=>{
                    db.collection('products').find({catalogId: results[i].catalogId}).limit(1).sort({discount_price: 1}).toArray((err, productPrice)=>{
                      if(productCounts){
                        var temper  = {catalogId: results[i].catalogId, catalogName: results[i].catalogName, images: [], total_product: productCounts, price: typeof productPrice[0]['discount_price'] != 'undefined' ? productPrice[0]['discount_price']  : productPrice[0]['price'], categoriesName: results[i].categoriesName};
                        for(var j=0; j< resultsProduct.length; j++){
                          if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != '' && resultsProduct[j]['product_image'] != null){
                            temper.images.push(config.HOST+':'+port+'/'+resultsProduct[j]['product_image']);
                          }
                        }
                        temper.totalProductImageCount = temper.images.length;
                        if(temper.images.length){
                          arr.push(temper);
                        }
                        if(typeof results[++i] != 'undefined'){
                          temp(results, arr, i, done);
                        }else{
                          return done(arr);
                        }
                      }else{
                        if(typeof results[++i] != 'undefined'){
                          temp(results, arr, i, done);
                        }else{
                          return done(arr);
                        }
                      }
                    })
                  })
                })
              }

              temp(results, [], 0, (done)=>{
                return res.send({error: 'N', 'data': {arr}, msg: '', totalCount: arr.length, screen: 'normalSearch'});
              })
            }
          })
        }
      })

      app.post('/api/'+config.API_VERSION+'/searchData', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.start == 'undefined' || typeof req.body.end == 'undefined' || typeof req.body.search == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});  
        }
        if(req.body.search == ''){
          return res.send({error: 'N', msg: '', data: [], totalCount: 0});
        }
        var aggregated = [
          {$match: {name: { $regex: req.body.search, $options: 'i'}}},
          {
              $lookup:{
                  from: "categories", 
                  localField: "cat_id", 
                  foreignField: "categoriesId",
                  as: "user_role"
              }
          },
          {   $unwind:"$user_role" },
          {
              $group : {
                _id : '$catalogID',
                catalogId: { $last: "$catalogID" },
                catalogName: { $last: "$name" },
                categoriesName: { $last: "$user_role.name" },
                categoriesId: { $last: "$user_role.catId" },
                count: { $sum: 1 }
              }
            },
            {$skip: parseInt(req.body.start)},
            {$limit: parseInt(req.body.end)}
          
          ];
        db.collection('catalogs').aggregate(aggregated).toArray((err, results)=>{
          if(results.length){
            function temp(results, arr, i, done){
              db.collection('products').find({catalogId: results[i].catalogId}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, resultsProduct)=>{
                db.collection('products').count({catalogId: results[i].catalogId}, (err, productCounts)=>{
                  db.collection('products').find({catalogId: results[i].catalogId}).limit(1).sort({discount_price: 1}).toArray((err, productPrice)=>{
                    if(productCounts){
                      var temper  = {catalogId: results[i].catalogId, catalogName: results[i].catalogName, images: [], total_product: productCounts, price: typeof productPrice[0]['discount_price'] != 'undefined' ? productPrice[0]['discount_price']  : productPrice[0]['price'], categoriesName: results[i].categoriesName};
                      for(var j=0; j< resultsProduct.length; j++){
                        if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != '' && resultsProduct[j]['product_image'] != null){
                          temper.images.push(config.HOST+':'+port+'/'+resultsProduct[j]['product_image']);
                        }
                      }
                      temper.totalProductImageCount = temper.images.length;
                      if(temper.images.length){
                        arr.push(temper);
                      }
                      if(typeof results[++i] != 'undefined'){
                        temp(results, arr, i, done);
                      }else{
                        return done(arr);
                      }
                    }else{
                      if(typeof results[++i] != 'undefined'){
                        temp(results, arr, i, done);
                      }else{
                        return done(arr);
                      }
                    }
                  })
                })
              })
            }

            temp(results, [], 0, (done)=>{
              return res.send({error: 'N', 'data': done, msg: '', totalCount: done.length});
            })
          }else{
            return res.send({error: 'N', msg: '', data: [], totalCount: 0});
          }
        })
      })

      app.post('/api/'+config.API_VERSION+'/getCatalogProductOnCategories', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.start == 'undefined' || typeof req.body.end == 'undefined' || typeof req.body.categoriesId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.body});  
        }
        var limit = parseInt(req.body.end) - parseInt(req.body.start);
        var aggregated = [
            {$match: {categoriesId: parseInt(req.body.categoriesId)}},
            {
                $lookup:{
                    from: "categories", 
                    localField: "cat_id", 
                    foreignField: "categoriesId",
                    as: "user_role"
                }
            },
            {   $unwind:"$user_role" },
            {
                $group : {
                  _id : '$catalogID',
                  catalogId: { $last: "$catalogID" },
                  catalogName: { $last: "$name" },
                  categoriesName: { $last: "$user_role.name" },
                  categoriesId: { $last: "$user_role.catId" },
                  count: { $sum: 1 }
                }
              }
            ];
          db.collection('catalogs').aggregate(aggregated).toArray((err, totalCatalog)=>{
            aggregated.push({$skip: parseInt(req.body.start)},
              {$limit: limit});
            db.collection('catalogs').aggregate(aggregated).toArray((err, results)=>{
              if(results.length){
                function temp(results, arr, i, done){
                  db.collection('products').find({catalogId: results[i].catalogId}).limit(10).toArray((err, resultsProduct)=>{
                    db.collection('products').count({catalogId: results[i].catalogId, qty: {$gt: 0}}, (err, productCounts)=>{
                      db.collection('products').find({catalogId: results[i].catalogId, qty: {$gt: 0}}).limit(1).sort({discount_price: 1}).toArray((err, productPrice)=>{
                        if(productCounts){
                          var temper  = {catalogId: results[i].catalogId, catalogName: results[i].catalogName, images: [], total_product: productCounts, price: typeof productPrice[0]['discount_price'] != 'undefined' ? productPrice[0]['discount_price']  : productPrice[0]['price'], categoriesName: results[i].categoriesName};
                          for(var j=0; j< resultsProduct.length; j++){
                            if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != '' && resultsProduct[j]['product_image'] != null){
                              temper.images.push(config.HOST+':'+port+'/'+resultsProduct[j]['product_image']);
                            }
                          }
                          temper.totalProductImageCount = temper.images.length;
                          if(temper.images.length){
                            arr.push(temper);
                          }
                          if(typeof results[++i] != 'undefined'){
                            temp(results, arr, i, done);
                          }else{
                            return done(arr);
                          }
                        }else{
                          if(typeof results[++i] != 'undefined'){
                            temp(results, arr, i, done);
                          }else{
                            return done(arr);
                          }
                        }
                      })
                    })
                  })
                }

                temp(results, [], 0, (done)=>{
                  c("get getCatalogProductOnCategories totalCatalog.length ::::: ", totalCatalog.length);
                  return res.send({error: 'N', 'data': done, msg: '', totalCount: totalCatalog.length});
                })
              }else{
                return res.send({error: 'Y', msg: 'catalogs not available as per categories', data: []});
              }
            })
          })
        
      });

      app.get('/api/'+config.API_VERSION+'/myPaymentList', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path)
        if(typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined' || typeof req.query.resellerId == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        db.collection('reseller').find({_id: new MongoId(req.query.resellerId)}).toArray((err, results)=>{
          if(results.length){
            db.collection('orderplace').find({resellerId: req.query.resellerId}).toArray((err, totalResults)=>{
              if(totalResults.length){
                db.collection('orderplace').find({resellerId: req.query.resellerId}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, results)=>{
                  db.collection('orderplace').count({resellerId: req.query.resellerId}, (err, productCounts)=>{
                    if(productCounts){
                      var temper = [];
                      for (var i = 0; i < results.length; i++) {
                        temper.push(results[i].orderno);
                      }
                      function temp(results, i, done){
                        db.collection('orderproducts').find({orderno: {$in: temper}}).toArray((err, productOrders)=>{
                          results[i].productDetails = productOrders;
                          if(typeof results[++i] != 'undefined'){
                            temp(results, i, done);
                          }else{
                            return done(results);
                          }
                        })  
                      }

                      temp(results, 0, (done)=>{
                        return res.send({error: 'N', msg: '', data: done, totalCount: totalResults.length});
                      })
                    }else{
                      return res.send({error: 'Y', msg: 'payments not available', data: []});
                    }
                  })
                })
              }else{
                return res.send({error: 'Y', msg: 'payments not available', data: []});
              }
            })
          }else{
          return res.send({error: 'Y', msg: 'data not available!', data: []});
          }
        })
      });

      app.get('/api/'+config.API_VERSION+'/getHomeDetails', (req, res) => {
        c("appp ::::::::::::::::::: ", req.path, req.query)
        if(typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined'){
          return res.send({error: 'Y', msg: 'parameter invalid', data: req.query});  
        }
        var limit = parseInt(req.query.end)-parseInt(req.query.start);
        var aggregated = [
            {$match: {_ia: 1}},
            {
                $lookup:{
                    from: "categories", 
                    localField: "cat_id", 
                    foreignField: "categoriesId",
                    as: "user_role"
                }
            },
            {   $unwind:"$user_role" },
            {
                $group : {
                  _id : '$catalogID',
                  catalogId: { $last: "$catalogID" },
                  catalogName: { $last: "$name" },
                  catalogImg : { $last: "$catalog_image" },
                  catalogDescription: { $last: "$description" },
                  categoriesName: { $last: "$user_role.name" },
                  categoriesId: { $last: "$user_role.catId" },
                  count: { $sum: 1 }
                }
              }
            ];
          db.collection('catalogs').aggregate(aggregated).toArray((err, totalCount)=>{
            aggregated.push({'$skip': parseInt(req.query.start)},
              {'$limit': limit});
            db.collection('catalogs').aggregate(aggregated).toArray((err, aggresults)=>{
              if(aggresults.length){
                function temp(results, arr, i, done){
                  db.collection('products').find({catalogId: typeof results[i].catalogId != 'undefined' ? results[i].catalogId : '', qty: {$gt: 0}}).limit(10).toArray((err, resultsProduct)=>{
                    db.collection('products').count({catalogId: results[i].catalogId, qty: {$gt: 0}}, (err, productCounts)=>{
                      db.collection('products').find({catalogId: results[i].catalogId, qty: {$gt: 0}}).limit(1).sort({discount_price: 1}).toArray((err, productPrice)=>{
                        if(productCounts){
                          var temper  = {catalogId: results[i].catalogId, catalogName: results[i].catalogName,catalogImg: results[i].catalogImg,catalogDescription: results[i].catalogDescription, images: [], total_product: productCounts, price: typeof productPrice[0]['discount_price'] != 'undefined' ? productPrice[0]['discount_price']  : productPrice[0]['price'] , categoriesName: results[i].categoriesName};
                          for(var j=0; j< resultsProduct.length; j++){
                            if(typeof resultsProduct[j]['product_image'] != 'undefined' && resultsProduct[j]['product_image'] != '' && resultsProduct[j]['product_image'] != null){
                              temper.images.push(config.HOST+':'+port+'/'+resultsProduct[j]['product_image']);
                            }
                          }
                          temper.totalProductImageCount = temper.images.length;
                          if(temper.images.length){
                            arr.push(temper);
                          }
                          if(typeof results[++i] != 'undefined'){
                            temp(results, arr, i, done);
                          }else{
                            return done(arr);
                          }
                        }else{
                          if(typeof results[++i] != 'undefined'){
                            temp(results, arr, i, done);
                          }else{
                            return done(arr);
                          }
                        }
                      })
                    })
                  })
                }
                temp(aggresults, [], 0, (done)=>{
                  c("get Home Details totalCount.length :::::::::::::::: ", totalCount.length);
                  console.log("get Home Details totalCount.length :::::::::::::::: ", totalCount.length);
                  console.log(done);
                  var data = {error: 'N', 'data': done, msg: '', totalCount: totalCount.length};
                  return res.send(data);
                })
              }else{
                return res.send({error: 'Y', msg: 'catalogs not available as per categories', data: []});
              }
            })
          }) 
        
      });

      app.post('/api/'+config.API_VERSION+'/getSingleOrderDetails', (req, res) => {
        c("appppp ::::::::::::::::::::::::::::::::::: ", req.path)
        if(typeof req.body.orderno == 'undefined'){
          return res.send({error: 'Y', msg: 'data not valid'});
        }
        db.collection('orderplace').find({orderno: parseInt(req.body.orderno)}).toArray((err, totalResults)=>{
          if(totalResults.length){
            db.collection('orderproducts').find({orderno: parseInt(req.body.orderno)}).toArray((err, productOrders)=>{
              db.collection('manifestfiles').find({orderno: parseInt(req.body.orderno)}).toArray((err, orderMani)=>{
                if(orderMani.length){
                  totalResults[0].awbNumber = orderMani.length ? typeof orderMani[0]['awbNumber'] != 'undefined' ? orderMani[0]['awbNumber'] : '' : '';
                }
                totalResults[0].productDetails = productOrders;
                totalResults[0].created_at = _date(totalResults[0].created_at).format('DD MMMM, YYYY HH:mm A');

                return res.send({error: 'N', msg: '', data: totalResults});
              })
            })  
          }else{
            return res.send({error: 'Y', msg: 'catalogs not available', data: []});
          }
        })
      });

      app.post('/api/'+config.API_VERSION+'/orderTrackingDetails', (req, res) => {
        console.log("appppp ::::::::::::::::::::::::::::::::::: ", req.path, req.body)
        if(typeof req.body.id == 'undefined'){
          return res.send({error: 'Y', msg: 'data not valid'});
        }
        db.collection('orderplace').find({orderno: parseInt(req.body.id)}).toArray((err, orderResults)=>{
          if(orderResults.length){
            if(common.InArray(orderResults[0].resellerId, ['5cb8656290b1450f7d143885', '5c5969d888094f6dca31ef0a' , '5d8af9177b7f0c028cd17094'])){
              return res.send({
                  "error": "N",
                  "msg": "",
                  "data": [
                      {
                          "AWBNo": "1392319500004",
                          "AuthKey": "Valid",
                          "CountryCode": "IN",
                          "OrderNo": "1009",
                          "ReturnMessage": "Successful",
                          "ShipmentSummary": [
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "Surat/HUB, Surat, GUJARAT",
                                  "DestinationLocation": "",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "3/30/2019 10:57:55 PM",
                                  "Status": "Delivered",
                                  "StatusCode": "DLVD",
                                  "StatusDate": "30-03-2019",
                                  "StatusTime": "1524",
                                  "Location": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Comment": "Shipment Delivered by SR: deepak mahadik, MobileNo: 8551055809, DeliveryDate:2019-03-30 1524, Receiver Name: shital yuvraj jagtap Remarks : ",
                                  "LocationPinCode": "415311"
                              },
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "Surat/HUB, Surat, GUJARAT",
                                  "DestinationLocation": "",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "3/30/2019 10:57:55 PM",
                                  "Status": "Out for Delivery",
                                  "StatusCode": "OFD",
                                  "StatusDate": "30-03-2019",
                                  "StatusTime": "1206",
                                  "Location": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Comment": "Out for delivery: 102984-deepak mahadik-PDS198912065202984",
                                  "LocationPinCode": "415311"
                              },
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "Surat/HUB, Surat, GUJARAT",
                                  "DestinationLocation": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "3/30/2019 10:57:55 PM",
                                  "Status": "Reached at Destination",
                                  "StatusCode": "RAD",
                                  "StatusDate": "30-03-2019",
                                  "StatusTime": "1153",
                                  "Location": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Comment": "InScan",
                                  "LocationPinCode": "415311"
                              },
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "Surat/HUB, Surat, GUJARAT",
                                  "DestinationLocation": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "3/30/2019 10:57:55 PM",
                                  "Status": "InTransit",
                                  "StatusCode": "IT",
                                  "StatusDate": "28-03-2019",
                                  "StatusTime": "1526",
                                  "Location": "PNQ/CHK, Pune, Maharashtra",
                                  "Comment": "Shipment added in ParentBagNo: XB-C5229829",
                                  "LocationPinCode": "411111"
                              },
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "Surat/HUB, Surat, GUJARAT",
                                  "DestinationLocation": "RSC/Nevari, NEVARI, MAHARASHTRA",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "3/30/2019 10:57:55 PM",
                                  "Status": "Picked",
                                  "StatusCode": "PKD",
                                  "StatusDate": "26-03-2019",
                                  "StatusTime": "2257",
                                  "Location": "Surat/HUB, Surat, GUJARAT",
                                  "Comment": "Shipment InScan from Manifest",
                                  "LocationPinCode": "395000"
                              },
                              {
                                  "PickUpDate": "26-03-2019",
                                  "PickUpTime": "1814",
                                  "OriginLocation": "",
                                  "DestinationLocation": "",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "",
                                  "Status": "PickDone",
                                  "StatusCode": "PUD",
                                  "StatusDate": "26-03-2019",
                                  "StatusTime": "1814",
                                  "Location": "Surat/HUB, Surat, GUJARAT",
                                  "Comment": "",
                                  "LocationPinCode": null
                              },
                              {
                                  "PickUpDate": null,
                                  "PickUpTime": null,
                                  "OriginLocation": "",
                                  "DestinationLocation": "",
                                  "Weight": "0",
                                  "ExpectedDeliveryDate": "",
                                  "Status": "Data Received",
                                  "StatusCode": "DRC",
                                  "StatusDate": "26-03-2019",
                                  "StatusTime": "1437",
                                  "Location": "Surat/HUB, Surat, GUJARAT",
                                  "Comment": "",
                                  "LocationPinCode": null
                              }
                          ]
                      }
                  ]
              });
            }else{
              db.collection('manifestfiles').find({orderno: parseInt(req.body.id)}).toArray((err, orderMani)=>{
                c("orderMani :::::::::: ", orderMani);
                if(orderMani.length && typeof orderMani[0].manifestId != 'undefined' && orderMani[0].manifestId != null){
                  console.log("orderMani :::::: ", err, orderMani);
                  var jsonData = {
                    "XBkey": ex.AccessFormat.XBkeyGet,
                    AWBNo: orderMani[0].awbNumber
                  };
                  console.log("jsonData :::::::::::::::::::::::: json ::::::::: ", jsonData)
                  _req({"url": ex.getShipmentSummaryDetails, 
                    "json": true, 
                    "method": "post",
                    "body": jsonData}, (err, httpResponse, body)=>{

                    console.log("error :::::: ", err);
                    console.log("body ::::::: ", body);
                    var cb = {error: 'N', msg: '', data: []};
                    
                    if(body[0].AuthKey == 'Valid' && body[0].ShipmentSummary != null){
                      cb.data = body;
                    }
                    return res.send(cb);
                  })
                }else{
                  c('Tracking not available!')
                  var cb = {error: 'N', msg: 'Tracking not available!', data: []};
                  return res.send(cb);
                }
              })
            }
          }else{
            c('order not available!')
            var cb = {error: 'N', msg: 'Tracking not available!', data: []};
            return res.send(cb);
          }

        })
      });
    }
};
