var files = require('./fileUploads.js');
var watermark = require('image-watermark');
var pdf = require('html-pdf');
var fs = require('fs');
var admin = require("firebase-admin");

var serviceAccount = require("../sun-supply-f1d7c-firebase-adminsdk-irsgl-2943730343.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://sun-supply-f1d7c.firebaseio.com"
});

BaseUrl = config.HOST + ':' + port;
module.exports = {
	responseData: (file, data, res) => {
		data['BaseUrl'] = BaseUrl;
		data['active'] = typeof sess.active != 'undefined' ? sess.active : 'dashboard';
		res.render(file, data);
	},
	Routes: (router) => {

		router.get('/check+todo/:orderno', (req, res) => {

			db.collection('orderplace').find({
				orderno: parseInt(req.params.orderno)
			}).toArray((err, results) => {
				db.collection('addresses').find({
					_id: new MongoId(results[0].addressId)
				}).toArray((err, addresults) => {
					db.collection('destination_code').find({
						pincode: addresults[0].pincode
					}).toArray((err, desresults) => {
						db.collection('orderproducts').find({
							orderno: parseInt(req.params.orderno)
						}).toArray((err, productresults) => {
							db.collection('manifestfiles').find({
								orderno: parseInt(req.params.orderno)
							}).toArray((err, manifestfiles) => {
								results[0].created_at = _date(results[0].created_at).format('DD MMMM, YYYY HH:mm A');
								results[0].destinationCode = desresults.length ? typeof desresults[0].area_code ? desresults[0].area_code : '' : '';
								results[0].awbNumber = manifestfiles.length ? typeof manifestfiles[0]['awbNumber'] != 'undefined' ? manifestfiles[0]['awbNumber'] : '' : '';

								var tablebody = '';
								var address = '';
								var totalQty = 0;
								var totalPrice = 0;
								var totalWeight = 0;
								var i = 1;

								for (var j = 0; j < productresults.length; j++) {
									var productName = typeof productresults[j].ProductName != 'undefined' ? productresults[j].ProductName : '-';
									tablebody += '<tr style="height: 25px !important;">' +
										'<td class="text-center">' + results[0].orderno + '</td>' +
										'<td class="text-center">' + productName + '</td> ' +
										'<td class="text-center">' + productresults[j].qty + '</td> ' +
										'<td class="text-center">' + productresults[j].size + '</td>';

									/*if(data.data.paymentMethod == '1' || data.data.paymentMethod == '2') {

									  tablebody += '<td class="text-center ng-binding">'+(parseFloat(data.data.productDetails[j].pricePerProduct) * parseInt(data.data.productDetails[j].qty))+'</td>';
									}*/
									if (productresults.length - 1 == j) {
										var status = '-';
										if (results[0].paymentMethod == '2') {
											status = 'COD';
										} else {
											status = 'PREPAID';
										}
										tablebody += '<td class="text-center" rowspan="' + productresults.length + '">' + status + '</td>';
									}
									tablebody += '</tr>';
									totalQty += parseInt(productresults[j].qty);
									totalPrice += parseInt(productresults[j].pricePerProduct);
									totalWeight += parseInt(productresults[j].weight) * totalQty;

									i++;
								}

								if (typeof addresults[0].name != 'undefined') {
									if (addresults[0].name.length < 2400) {
										address += addresults[0].name + '<br>';
									} else {
										address += addresults[0].name.slice(0, 20) + '<br>';
										address += addresults[0].name.slice(20, addresults[0].name.length) + '<br>';
									}
								}

								if (typeof addresults[0].building != 'undefined') {
									if (addresults[0].building.length < 2600) {
										address += addresults[0].building + '<br>';
									} else {
										address += addresults[0].building.slice(0, 20) + '<br>';
										if (addresults[0].building.length > 30) {
											address += addresults[0].building.slice(20, 30) + '<br>';
											address += addresults[0].building.slice(30, addresults[0].building.length) + '<br>';
										} else {
											address += addresults[0].building.slice(20, addresults[0].building.length) + '<br>';
										}
									}
								}
								if (typeof addresults[0].street != 'undefined') {
									if (addresults[0].street.length < 2600) {
										address += addresults[0].street + '<br>';
									} else {
										address += addresults[0].street.slice(0, 20) + '<br>';
										if (addresults[0].street.length > 30) {
											address += addresults[0].street.slice(20, 30) + '<br>';
											address += addresults[0].street.slice(30, addresults[0].street.length) + '<br>';
										} else {
											address += addresults[0].street.slice(20, addresults[0].street.length) + '<br>';
										}
									}
								}
								if (typeof addresults[0].city != 'undefined') {

									address += addresults[0].city + ' ';
								}
								if (typeof addresults[0].landmark != 'undefined') {

									address += addresults[0].landmark + ' ';
								}
								if (typeof addresults[0].state != 'undefined') {

									address += addresults[0].state + ' ';
								}
								if (typeof addresults[0].pincode != 'undefined') {

									address += addresults[0].pincode + ' ';
								}
								var senderName = results[0].senderDetails.split(',');
								console.log("address :::::::: ", address);
								var html = '<!DOCTYPE html><html><head> <title></title></head><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><style type="text/css">html {zoom: 0.75;} body{background:#EEE; /* font-size:0.4em !important; */}.invoice{width:970px !important; margin:50px auto; .invoice-header{padding:25px 25px 15px; h1{margin:0}.media{.media-body{font-size:.9em; margin:0;}}}.invoice-body{border-radius:10px; padding:25px; background:#FFF;}.invoice-footer{padding:15px; font-size:0.9em; text-align:center; color:#999;}}.logo{max-height:70px; border-radius:10px;}.dl-horizontal{margin:0; dt{float: left; width: 80px; overflow: hidden; clear: left; text-align: right; text-overflow: ellipsis; white-space: nowrap;}dd{margin-left:90px;}}td{font-size: 25px;}div{font-size: 25px;}.rowamount{padding-top:15px !important;}.rowtotal{font-size:1.3em;}/*.colfix{width:12%;}*/.mono{font-family:monospace;}.table>thead>tr>th{font-size: 18px; vertical-align: top !important;}</style><body><div class="container invoice"> <div class="invoice-body" style="width: 81% !important;"> <div class="row"> <div class="col-xs-5" style=" padding-right: 0 !important;"> <div class="panel panel-default" style="width: 115%;"> <div class="panel-heading"> <h3 class="panel-title">To</h3> </div><div class="panel-body" align="left"> <dl class="dl-horizontal">  <dd style=" margin-left: 0 !important;">' + address + '</dd> <dd style=" margin-left: 0 !important;">Mob: ' + addresults[0].phone_no + '</dd> </div></div></div><div class="col-xs-7" style=" padding-left: 46px !important;"> <div class="panel panel-default" style="width: 100%;"> <div class="panel-heading"> <h3 class="panel-title">Tracking ID</h3> </div><div class="panel-body"> <dl class="dl-horizontal"> <dd style="margin-left: -12px !important;"><img id="awbbarcode" src="https://www.barcodesinc.com/generator/image.php?code=' + results[0].awbNumber + '&amp;style=196&amp;type=C128B&amp;width=370&amp;height=75&amp;xres=2&amp;font=4"></dd> </div></div></div></div><div class="panel panel-default" style="margin: auto;"> <table class="table table-bordered table-condensed"> <thead> <tr style="height: 60px;"> <th class="text-center colfix" width="10%">Order ID</th> <th class="text-center colfix" width="60%">Product Name & SKU</th> <th class="text-center colfix" width="10%">Pieces</th> <th class="text-center colfix" width="10%">Size</th> <th class="text-center colfix" width="10%"></th> </tr></thead> <tbody> ' + tablebody + ' </tbody> </table> </div><div class="row"> <div class="col-xs-7"> <div class="panel panel-default" style="margin: auto;"> <div class="panel-body"> FROM <hr style="margin:3px 0 5px"/> ' + senderName[0] + '</div></div></div><div class="col-xs-7"> <div class="panel panel-default" style="margin: auto;"> <div class="panel-body"> Courier Name <hr style="margin:3px 0 5px"/> XPRESSBEES </div></div></div><div class="col-xs-7"> <div class="panel panel-default" style="margin: auto;"> <div class="panel-body"> Destination Code <hr style="margin:3px 0 5px"/> ' + results[0].destinationCode + ' </div></div></div></div></div></div></body></html>';
								var options = {
									format: 'A4',
									margin: '1cm'
								};
								pdf.create(html, options).toStream(function (err, stream) {
									var id = results[0].orderno;
									stream.pipe(fs.createWriteStream(require('path').join(__dirname, '../views/img/pdf/' + id + '.pdf')));
									setTimeout(function () {
										res.download(require('path').join(__dirname, '../views/img/pdf/' + id + '.pdf'));
										return true;
									}, 500);
								});
							})
						})
					})
				})
			})
		})
		router.get('/', (req, res) => {
			sess = req.session;
			sess.active = 'dashboard';
			if (typeof sess.user != 'undefined') {
				res.redirect('/dashboard');
			} else {
				webHandler.responseData('login.html', {
					error: false
				}, res);
			}
		})
		router.post('/', (req, res) => {
			sess = req.session;
			sess.active = 'dashboard';
			if (typeof req.body.user == 'undefined' || typeof req.body.password == 'undefined') {
				return res.send({
					error: true,
					msg: 'parameter invalid'
				});
			}

			c("body ::::::: ", req.body);

			db.collection('admin').find({
				user: req.body.user,
				password: req.body.password
			}).toArray((err, results) => {
				if (results.length) {
					sess.user = req.body.user;
					webHandler.getTotalCounts((done) => {
						var data = {
							error: false,
							total: done
						};
						webHandler.responseData('dashboard.html', data, res);
					})
				} else {
					webHandler.responseData('login.html', {
						msg: 'Login Invalid',
						error: true
					}, res);
				}
			})
		})

		router.get('/logout', (req, res) => {
			req.session.destroy(function (err) {
				res.redirect('/');
			})
		})
		router.get('/dashboard', (req, res) => {
			sess = req.session;
			sess.active = 'dashboard';
			if (typeof sess.user != 'undefined') {
				webHandler.getTotalCounts((done) => {
					var data = {
						error: false,
						total: done
					};
					webHandler.responseData('dashboard.html', data, res);
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/getTopSell', (req, res) => {
			console.log("getTopSell :::::: ");
			db.collection('orderproducts').aggregate([{
				$group: {
					_id: '$productId',
					totalCount: {
						$sum: 1
					},
					name: {
						$last: '$ProductName'
					},
					size: {
						$last: '$size'
					},
					weight: {
						$last: '$weight'
					},
					image: {
						$last: '$image'
					},
					price: {
						$last: '$pricePerProduct'
					}
				}
			}, {
				$sort: {
					totalCount: -1
				}
			}]).toArray((err, topSell) => {
				res.send(topSell);
			})
		})
		router.get('/getViewPaidMargin', (req, res) => {
			console.log("getViewPaidMargin :::::: ");
			db.collection('reseller').find({
				paid_margin: {
					$gt: 0
				}
			}).sort({
				paid_margin: -1
			}).toArray((err, topSell) => {
				res.send(topSell);
			})
		})
		router.get('/getTotalMarginData', (req, res) => {
			console.log("getTotalMarginData :::::: ");
			db.collection('reseller').find({
				payable_margin: {
					$gt: 0
				}
			}).sort({
				payable_margin: -1
			}).toArray((err, topSell) => {
				res.send(topSell);
			})
		})
		router.get('/getViewLeftMargin', (req, res) => {
			console.log("getViewLeftMargin :::::: ");
			db.collection('reseller').find({
				payable_margin: {
					$gt: 0
				}
			}).sort({
				payable_margin: -1
			}).toArray((err, topSell) => {
				res.send(topSell);
			})
		})
		router.get('/getTopSellerList', (req, res) => {
			var pipeline = [{
				$lookup: {
					from: "vendor",
					localField: "vendorId",
					foreignField: "_id",
					as: "user_role"
				}
			}, {
				$group: {
					_id: '$_id',
					totalCount: {
						$sum: 1
					},
					totalSell: {
						$sum: '$totalAmount'
					},
					vendorDetails: {
						$last: "$user_role"
					}
				}
			}, {
				$sort: {
					totalSell: -1
				}
			}];

			db.collection('orderplace').aggregate(pipeline).toArray((err, topSell) => {
				console.log("topSell :::::::: ", topSell);
				return res.send(topSell);
			})
		})
		router.get('/getTotal Carts', (req, res) => {

		})
		router.get('/getMostShareCatalogs', (req, res) => {
			var pipeline = [{
				$lookup: {
					from: "catalogs",
					localField: "catalogId",
					foreignField: "catalogID",
					as: "user_role"
				}
			}, {
				$group: {
					_id: '$catalogId',
					totalCount: {
						$sum: 1
					},
					catalogDetails: {
						$last: "$user_role"
					}
				}
			}, {
				$sort: {
					totalCount: -1
				}
			}];

			db.collection('sharecatalog').aggregate(pipeline).toArray((err, mostShare) => {

				temp(mostShare, 0, (cbv) => {
					return res.send(cbv);
				})

				function temp(data, i, done) {
					if (data.length && data[i].catalogDetails.length > 0) {
						data[i].catalogDetails[0].created_at = _date(data[i].catalogDetails[0].created_at).format('DD MMMM, YYYY HH:mm:ss');
						db.collection('products').find({
							catalogId: data[i].catalogDetails[0].catalogID
						}).limit(1).toArray((err, results) => {
							if (results.length) {
								data[i].catalogDetails[0].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/' + results[0].product_image;
							} else {
								data[i].catalogDetails[0].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/img/snfl.png';
							}
							if (typeof data[++i] != 'undefined') {
								temp(data, i, done);
							} else {
								return done(data);
							}
						})
					} else {
						return done(data);
					}
				}
			})
		})
		router.get('/addbanner', (req, res) => {
			sess = req.session;
			sess.active = 'addbanner';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('banner').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							data.data = results[0];
						} else {
							data.data = {};
						}
						webHandler.responseData('addbanner.html', data, res);
					})

				} else {
					data.data = {};
					webHandler.responseData('addbanner.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})
		router.get('/cartlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'cartlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var pipeline = [{
					$lookup: {
						from: "products",
						localField: "productId",
						foreignField: "productId",
						as: "user_role"
					}
				}, {
					$group: {
						_id: '$resellerId',
						qty: {
							$sum: "$qty"
						},
						productDetails: {
							$last: "$user_role"
						},
						productId: {
							$last: "$productId"
						},
						createdat: {
							$last: "$createdat"
						}
					}
				}, {
					$sort: {
						createdat: -1
					}
				}];

				db.collection('cart').aggregate(pipeline).toArray((err, countresults) => {
					var pipeline = [{
						$lookup: {
							from: "products",
							localField: "productId",
							foreignField: "productId",
							as: "user_role"
						}
					}, {
						$group: {
							_id: '$resellerId',
							qty: {
								$sum: "$qty"
							},
							productDetails: {
								$last: "$user_role"
							},
							productId: {
								$last: "$productId"
							},
							size: {
								$last: "$size"
							},
							createdat: {
								$last: "$createdat"
							}
						}
					}, {
						$sort: {
							createdat: -1
						}
					}, {
						$skip: parseInt(skip)
					}, {
						$limit: parseInt(perPage)
					}];

					db.collection('cart').aggregate(pipeline).toArray((err, results) => {
						function temp(results, i, done) {
							results[i].createdat = _date(results[i].createdat).format('DD MMMM, YYYY HH:mm:ss');
							db.collection('reseller').find({
								_id: new MongoId(results[i]._id)
							}).toArray((err, resellerData) => {
								if (resellerData.length) {
									results[i]['profile'] = resellerData[0];
								} else {
									results[i]['profile'] = {};
								}
								if (typeof results[++i] != 'undefined') {
									temp(results, i, done);
								} else {
									return done(results);
								}
							})
						}
						temp(results, 0, (dd) => {
							data['data'] = dd;
							data['current'] = page;
							data['pages'] = Math.ceil(countresults.length / perPage);
							webHandler.responseData('cartlist.html', data, res);
						})
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/bannerlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'bannerlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('banner').count((err, totalCount) => {
					db.collection('banner').find({}).skip(skip).limit(perPage).toArray((err, results) => {
						if (results.length) {
							data['data'] = results;
							data['current'] = page;
							data['pages'] = Math.ceil(totalCount / perPage);
							webHandler.responseData('bannerlist.html', data, res);
						} else {
							data['current'] = page;
							data['pages'] = 0;
							data['data'] = [];
							webHandler.responseData('bannerlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/deleteBanner/:id', (req, res) => {
			sess = req.session;
			sess.active = 'bannerlist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('banner').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 200
						});
					} else {
						return res.send({
							error: true,
							status: 500
						});
					}
				})
			} else {
				res.redirect('/bannerlist/1');
			}
		})
		router.post('/api/uploadImpsRequest', (req, res) => {
			files.impsUpload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					res.send({
						error: 'Y',
						msg: err.code
					});
				} else if (err) {
					// An unknown error occurred when uploading.
					res.send({
						error: 'Y',
						msg: err.code
					});
				}
				console.log("uploadImpsRequest ::::::::::::::::::: ", req.body)
				if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
					if (typeof req.body.resellerId == 'undefined' || typeof req.body.accountname == 'undefined' || typeof req.body.accountno == 'undefined' || typeof req.body.bankname == 'undefined' || typeof req.body.ifsc == 'undefined') {
						return res.send({
							error: 'Y',
							msg: 'parameter invalid',
							data: req.body
						});
					}
					var IMPS = {
						resellerId: req.body.resellerId,
						image: BaseUrl + '/public/imps/' + req.file.filename,
						bankname: req.body.bankname,
						accountno: req.body.accountno,
						accountname: req.body.accountname,
						ifsc: req.body.ifsc
					};
					db.collection('resellerimps').insertOne(IMPS, (err, results) => {
						if (err) {
							return res.send({
								error: 'Y',
								msg: 'mysql error',
								data: error
							});
						} else {
							res.send({
								error: 'N',
								'msg': 'IMPS successfully added!',
								image: IMPS.image,
								id: results.ops[0]._id.toString()
							});
						}
					})
				} else {
					console.log("FIle Not Uploaded !");
					return res.send({
						error: 'Y',
						msg: ' uploadImpsRequest image uploading Error'
					});
				}
			})
		});
		router.post('/addbanner', (req, res) => {
			c("addbanner ::::::::::::::::::::::::::::::: ");
			sess = req.session;
			sess.active = 'addbanner';
			if (typeof sess.user != 'undefined') {
				files.bannerUpload(req, res, function (err) {
					if (err instanceof multer.MulterError) {
						// A Multer error occurred when uploading.
						res.send(err);
					} else if (err) {
						// An unknown error occurred when uploading.
						res.send(err);
					}
					if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
						db.collection('banner').find({
							name: req.body.name
						}).toArray((err, results) => {
							if (results.length) {
								c("req.body ::::::::::::::::::::::::::::::::::::::: ", req.body);
								if (typeof req.body.bannerId != 'undefined' && req.body.bannerId != '') {

									webHandler.updateBannerDetails(req.body, req.file.filename, (done) => {
										res.redirect('/bannerlist/1');
									})

								} else {
									sess = req.session;
									sess.error = 'Data Not Saved Banner Already Present into system!';
									res.redirect('/addbanner');
								}
							} else {
								var bannerData = {
									name: req.body.name,
									banner_image: BaseUrl + '/public/banner/' + req.file.filename
								};
								db.collection('banner').insertOne(bannerData, (err, results) => {
									if (err) {
										sess = req.session;
										sess.error = 'Data Not Saved!';
										res.redirect('/addbanner');
									} else {
										res.redirect('/bannerlist/1');
									}
								})
							}
						})
					} else {
						if (typeof req.body.bannerId != 'undefined' && req.body.bannerId != '') {

							webHandler.updateBannerDetails(req.body, '', (done) => {
								res.redirect('/bannerlist/1');
							})

						} else {
							sess = req.session;
							sess.error = 'Banner Image Not Uploaded!';
							res.redirect('/addbanner');
						}
					}

				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/addvendor', (req, res) => {
			sess = req.session;
			sess.active = 'addvendor';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('vendor').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							data.data = results[0];
						} else {
							data.data = {};
						}
						webHandler.responseData('addvendor.html', data, res);
					})

				} else {
					data.data = {};
					webHandler.responseData('addvendor.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})
		router.post('/addvendor', (req, res) => {
			sess = req.session;
			sess.active = 'addvendor';
			if (typeof sess.user != 'undefined') {
				files.vendorUpload(req, res, function (err) {
					if (err instanceof multer.MulterError) {
						// A Multer error occurred when uploading.
						c("err ::::::::::: ", err)
						return res.send({
							error: 'Y',
							msg: err.code
						});
					} else if (err) {
						// An unknown error occurred when uploading.
						c("err ::::::::::: ", err)
						return res.send({
							error: 'Y',
							msg: err.code
						});
					}
					var files = "http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/img/snfl.png";
					var find = {
						'$or': [{
							email: req.body.email
						}]
					};
					if (typeof req.body.GST_number != 'undefined') {
						find['$or'].push({
							GST_number: req.body.GST_number
						});
					}
					if (typeof req.body.accountno != 'undefined') {
						find['$or'].push({
							accountno: req.body.accountno
						});
					}
					if (typeof req.body.contactno != 'undefined') {
						find['$or'].push({
							contactno: req.body.contactno
						});
					}
					if (typeof req.body.address != 'undefined') {
						find['$or'].push({
							address: req.body.address
						});
					}
					db.collection('vendor').find(find).toArray((err, results) => {
						if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
							files = BaseUrl + '/public/vendor/' + req.file.filename;
						}
						if (results.length) {
							if (typeof req.body.vendorId != 'undefined') {

								webHandler.updateVendorDetails(req.body, files, (done) => {
									res.redirect('/vendorlist/1');
								})

							} else {
								sess = req.session;
								sess.error = 'Data Not Saved Vendor Already Present into system!';
								res.redirect('/addvendor');
							}
						} else {
							var vendorData = {
								name: req.body.name,
								profile: files,
								address: typeof req.body.address != 'undefined' ? req.body.address : '',
								contactno: typeof req.body.contactno != 'undefined' ? req.body.contactno : '',
								GST_number: typeof req.body.GST_number != 'undefined' ? req.body.GST_number : '',
								bankname: typeof req.body.bankname != 'undefined' ? req.body.bankname : '',
								accountno: typeof req.body.accountno != 'undefined' ? req.body.accountno : '',
								accountname: typeof req.body.accountname != 'undefined' ? req.body.accountname : '',
								ifsc: typeof req.body.ifsc != 'undefined' ? req.body.ifsc : '',
								email: typeof req.body.email != 'undefined' ? req.body.email : '',
								password: typeof req.body.password != 'undefined' ? req.body.password : '',
								created_at: new Date()
							};
							db.collection('vendor').insertOne(vendorData, (err, results) => {
								if (!err) {
									res.redirect('/vendorlist/1');
								} else {
									c("error ::::::::::::::::::::: vendor :::::: ", err);
									sess = req.session;
									sess.error = 'Data Not Saved!';
									res.redirect('/addvendor');
								}
							})
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/vendorlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'vendorlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('vendor').count((err, totalCount) => {
					db.collection('vendor').find({}).sort({
						created_at: -1
					}).skip(skip).limit(perPage).toArray((err, results) => {
						if (results.length) {
							for (var i = 0; i < results.length; i++) {
								results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
							}
							data['data'] = results;
							data['search'] = {};
							data['current'] = page;
							data['pages'] = Math.ceil(totalCount / perPage);
							webHandler.responseData('vendorlist.html', data, res);
						} else {
							data['current'] = page;
							data['search'] = {};
							data['pages'] = 0;
							data['data'] = [];
							webHandler.responseData('vendorlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/vendorlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'vendorlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var wh = {};
				if (req.body.search != '') {
					if (req.body.by != '') {
						if (req.body.by == 'name') {
							wh['name'] = {
								$regex: req.body.search,
								$options: '$i'
							};
						} else if (req.body.by == 'accountno') {
							wh['accountno'] = req.body.search;
						} else if (req.body.by == 'ifsc') {
							wh['ifsc'] = req.body.search;
						} else if (req.body.by == 'contact') {
							wh['contactno'] = req.body.search.trim();
						} else if (req.body.by == 'id') {
							if (req.body.search.toString().trim().length == 24) {
								wh['_id'] = new MongoId(req.body.search.toString().trim());
							} else {
								wh['_id'] = new MongoId('000000000000000000000000');
							}
						}
					}
				}
				if (req.body.todate != '' && req.body.fromdate != '') {
					wh['$and'] = [{
						created_at: {
							$gte: new Date(req.body.todate + ' 00:00:00')
						}
					}, {
						created_at: {
							$lte: new Date(req.body.fromdate + ' 23:59:59')
						}
					}]
				}

				console.log("wh :::::: ", wh)
				db.collection('vendor').count(wh, (err, totalCount) => {
					db.collection('vendor').find(wh).skip(skip).limit(perPage).toArray((err, results) => {
						if (results.length) {
							for (var i = 0; i < results.length; i++) {
								results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
							}
							data['data'] = results;
							data['search'] = req.body;
							data['current'] = page;
							data['pages'] = Math.ceil(totalCount / perPage);
							webHandler.responseData('vendorlist.html', data, res);
						} else {
							data['current'] = page;
							data['search'] = req.body;
							data['pages'] = 0;
							data['data'] = [];
							webHandler.responseData('vendorlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/deleteVendor/:id', (req, res) => {
			sess = req.session;
			sess.active = 'vendorlist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('vendor').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 200
						});
					} else {
						return res.send({
							error: true,
							status: 500
						});
					}
				})
			} else {
				res.redirect('/vendorlist/1');
			}
		})

		router.get('/addproduct', (req, res) => {
			sess = req.session;
			sess.active = 'addproduct';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('products').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							data.data = results[0];
							console.log("data ::::: ", data);
							webHandler.responseData('addproduct.html', data, res);
						}
					})
				} else {
					data.data = {};
					webHandler.responseData('addproduct.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})

		router.get('/productlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'productlist';
			var perPage = (typeof sess.productPerPage != 'undefined') ? parseInt(sess.productPerPage) : 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false,
					query: ''
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var filter = {};
				if (typeof req.query.id != 'undefined') {
					if (req.query.id == 1) {
						filter['qty'] = 0;
					} else if (req.query.id == 2) {
						filter['qty'] = {
							$gt: 0
						};
					} else if (req.query.id == 3) {
						filter['$and'] = [{
							qty: {
								$gt: 0
							}
						}, {
							qty: {
								$lte: 5
							}
						}];
					}
				}
				db.collection('products').count(filter, (err, totalProducts) => {
					var aggregated = [];
					if (typeof req.query.id != 'undefined') {
						aggregated.push({
							$match: filter
						});
						data.query = '?id=' + req.query.id;
					}

					aggregated.push({
							$lookup: {
								from: "catalogs",
								localField: "catalogId",
								foreignField: "catalogID",
								as: "user_role"
							}
						}, {
							$unwind: "$user_role"
						}, {
							$project: {
								_id: 1,
								id: '$_id',
								name: "$name",
								created_at: "$created_at",
								qty: "$qty",
								wright: "$weight",
								price: "$price",
								discount_pre: "$discount_pre",
								catalogId: "$catalogId",
								discount_price: "$discount_price",
								size: "$size",
								catalogName: "$user_role.name"

							}
						},

						{
							$skip: parseInt(skip)
						}, {
							$limit: parseInt(perPage)
						}

					);

					console.log("aggregated :::::: ", aggregated);
					db.collection('products').aggregate(aggregated).toArray((err, results) => {
						if (results.length) {
							for (var i = 0; i < results.length; i++) {
								results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
								results[i].discount_pre = 100 - (parseInt((results[i].discount_price) * 100) / parseInt(results[i].price));
								results[i].discount_pre = results[i].discount_pre.toFixed(2);
							}
							data['data'] = results;
							data['search'] = {
								perpage: perPage
							};
							data['current'] = page;
							data['pages'] = Math.ceil(parseInt(totalProducts) / perPage);

							temp(data['data'], 0, (cb) => {
								data['data'] = cb;
								webHandler.responseData('productlist.html', data, res);
							})

							function temp(data, i, done) {
								if (data.length) {
									db.collection('sharecatalog').count({
										catalogId: data[i].catalogId
									}, (err, shareCount) => {
										data[i].share = shareCount;
										if (typeof data[++i] != 'undefined') {
											temp(data, i, done);
										} else {
											return done(data);
										}
									})
								} else {
									return done(data);
								}
							}
						} else {
							data['current'] = page;
							data['search'] = {
								perpage: perPage
							};
							data['pages'] = 0;
							data['data'] = [];
							webHandler.responseData('productlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/productlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'productlist';
			var perPage = (typeof req.body.perpage != 'undefined') ? parseInt(req.body.perpage) : 10;
			sess.productPerPage = perPage;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;
			if (typeof req.body.by != 'undefined' && ((req.body.by != '') || (req.body.todate != '' && req.body.fromdate != '') || (req.body.minprice != '' && req.body.maxprice != ''))) {
				if (typeof sess.user != 'undefined') {
					var data = {
						error: false
					};
					if (typeof sess.error != 'undefined') {
						data.error = true;
						data.msg = sess.error;
						delete sess.error;
					}
					var wh = {};
					c("req.body :::::::::::::::::::::::::::::::: ", req.body);
					if (req.body.search != '') {
						if (req.body.by != '') {
							if (req.body.by == 'name') {
								wh['name'] = {
									$regex: req.body.search,
									$options: '$i'
								};
							} else if (req.body.by == 'price') {
								wh['price'] = parseInt(req.body.search);
							} else if (req.body.by == 'id') {
								if (req.body.search.toString().trim().length == 24) {
									wh['_id'] = new MongoId(req.body.search.toString().trim());
								} else {
									wh['_id'] = new MongoId('000000000000000000000000');
								}
							} else if (req.body.by == 'cat' && req.body.catalogId != '') {
								wh['catalogId'] = req.body.catalogId;
							}
						}
					} else {
						if (req.body.by != '') {
							if (req.body.by == 'cat' && req.body.catalogId != '') {
								wh['catalogId'] = req.body.catalogId;
							}
						}
					}
					if (req.body.todate != '' && req.body.fromdate != '') {
						wh['$and'] = [{
							created_at: {
								$gte: new Date(req.body.todate + ' 00:00:00')
							}
						}, {
							created_at: {
								$lte: new Date(req.body.fromdate + ' 23:59:59')
							}
						}]

						if (req.body.minprice != '' && req.body.maxprice != '') {
							wh['$and'].push({
								price: {
									$gte: parseInt(req.body.minprice)
								}
							}, {
								price: {
									$lte: parseInt(req.body.maxprice)
								}
							});
						}
					} else {
						if (req.body.minprice != '' && req.body.maxprice != '') {
							wh['$and'] = [{
								price: {
									$gte: parseInt(req.body.minprice)
								}
							}, {
								price: {
									$lte: parseInt(req.body.maxprice)
								}
							}];
						}
					}
					c("wh :::::::::::::: ", wh);

					db.collection('products').count(wh, (err, totalProducts) => {
						var aggregated = [{
								$match: wh
							},
							{
								$lookup: {
									from: "catalogs",
									localField: "catalogId",
									foreignField: "catalogID",
									as: "user_role"
								}
							},
							{
								$unwind: "$user_role"
							},
							{
								$project: {
									_id: 1,
									id: '$_id',
									name: "$name",
									created_at: "$created_at",
									qty: "$qty",
									wright: "$weight",
									price: "$price",
									discount_pre: "$discount_pre",
									catalogId: "$catalogId",
									discount_price: "$discount_price",
									size: "$size",
									catalogName: "$user_role.name"

								}
							},

							{
								$skip: parseInt(skip)
							},
							{
								$limit: parseInt(perPage)
							}

						]
						db.collection('products').aggregate(aggregated).toArray((err, results) => {
							if (results.length) {
								for (var i = 0; i < results.length; i++) {
									results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
								}
								data['data'] = results;
								data['search'] = req.body;
								data['current'] = page;
								data['pages'] = Math.ceil(parseInt(totalProducts) / perPage);
							} else {
								data['current'] = page;
								data['search'] = req.body;
								data['pages'] = 0;
								data['data'] = [];
							}
							temp(data['data'], 0, (cb) => {
								data['data'] = cb;
								webHandler.responseData('productlist.html', data, res);
							})

							function temp(data, i, done) {
								if (data.length) {
									db.collection('sharecatalog').count({
										catalogId: data[i].catalogId
									}, (err, shareCount) => {
										data[i].share = shareCount;
										if (typeof data[++i] != 'undefined') {
											temp(data, i, done);
										} else {
											return done(data);
										}
									})
								} else {
									return done(data);
								}
							}
						})
					})
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/productlist/' + req.params.page);
			}
		})
		router.post('/addproduct', (req, res) => {
			sess = req.session;
			sess.active = 'addproduct';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				files.productUpload(req, res, function (err) {
					if (err instanceof multer.MulterError) {
						// A Multer error occurred when uploading.
						return res.send(err);
					} else if (err) {
						// An unknown error occurred when uploading.
						return res.send(err);
					}
					if (typeof req.files != 'undefined' && req.files.length) {
						console.log("file size ::::  ========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.files.length);
						console.log("file size :::: ", req.files);
						if (typeof req.body.productId != 'undefined' && req.body.productId != '') {
							webHandler.updateProductDetails(req.body, req.files, (done) => {
								return res.redirect('/productlist/1');
							})

						} else {
							/*			    	db.collection('products').find({name: req.body.name}).toArray((err, results)=>{
										    		if(results.length){
										    			if(typeof req.body.productId != 'undefined' && req.body.productId != ''){
									 							
									 							webHandler.updateProductDetails(req.body, req.files, (done)=>{
																	return res.redirect('/productlist/1');
																})

									 						}else{
									 							sess = req.session;
													 			sess.error = 'Data Not Saved Product Already Present into system!';
													 			return  res.redirect('/addproduct');
									 						}
										    		}else{ */
							if (typeof req.body.catalogId != 'undefined') {
								db.collection('catalogs').find({
									catalogID: req.body.catalogId
								}).toArray((err, results) => {
									db.collection('products').find({
										catalogId: results[0].catalogID
									}).sort({
										created_at: -1
									}).toArray((err, results1) => {
										if (results.length) {
											var newID = '0';
											if (results1.length) {
												newID = typeof results1[0].id != 'undefined' ? parseInt(results1[0].id) + 1 : '0';
											}
											var productDetails = {
												catalogId: req.body.catalogId,
												cat_id: results[0].categoriesId,
												productId: 'product#' + new MongoId(),
												name: typeof req.body.name != 'undefined' ? req.body.name : '',
												price: typeof req.body.price != 'undefined' ? parseInt(req.body.price) : '',
												discount_pre: typeof req.body.discount_pre != 'undefined' ? parseInt(req.body.discount_pre) : 0,
												weight: typeof req.body.weight != 'undefined' ? parseInt(req.body.weight) : '',
												qty: typeof req.body.qty != 'undefined' ? parseInt(req.body.qty) : '',
												size: typeof req.body.size != 'undefined' ? req.body.size.toString() : '',
												description: typeof req.body.description != 'undefined' ? req.body.description : '',
												notes: typeof req.body.notes != 'undefined' ? req.body.notes : '',
												product_image: typeof req.files[0].filename != 'undefined' ? 'public/products/' + req.files[0].filename : '',
												product_image1: typeof req.files[1] != 'undefined' ? typeof req.files[1].filename != 'undefined' ? 'public/products/' + req.files[1].filename : '' : '',
												product_image2: typeof req.files[2] != 'undefined' ? typeof req.files[2].filename != 'undefined' ? 'public/products/' + req.files[2].filename : '' : '',
												product_image3: typeof req.files[3] != 'undefined' ? typeof req.files[3].filename != 'undefined' ? 'public/products/' + req.files[3].filename : '' : '',
												created_at: new Date(),
												updated_at: new Date(),
												id: ('0' + newID).slice(-2)
											};
											var olddata = {
												catalogId: productDetails.catalogId,
												name: productDetails.name,
												price: productDetails.price,
												discount_pre: productDetails.discount_pre,
												weight: productDetails.weight,
												qty: productDetails.qty,
												size: productDetails.size,
												description: productDetails.description,
												notes: productDetails.notes
											}
											data.data = olddata;
											if (productDetails.discount_pre) {
												productDetails.discount_price = productDetails.price - ((productDetails.discount_pre * productDetails.price) / 100);
											}

											var options = {
												'text': 'SF-' + results[0].id + '' + productDetails.id,
												'align': 'ltr',
												'color': 'rgb(0,0,0)'
											};
											console.log("options :::::: ", options);

											function writeImg(files, options, i, dd) {

												options['dstPath'] = require('path').join(__dirname, '../views/public/products/' + req.files[i].filename);
												watermark.embedWatermarkWithCb(options['dstPath'], options, (err) => {
													if (!err) {
														if (typeof files[++i] != 'undefined') {
															setTimeout(function () {
																writeImg(files, options, i, dd);
															}, 150)
														} else {
															return dd(true);
														}
													}
												});
											}
											writeImg(req.files, options, 0, (done1) => {
												db.collection('products').insertOne(productDetails, (err, results) => {
													if (!err) {
														//return res.redirect('/productlist/1');
														webHandler.responseData('addproduct.html', data, res);
													} else {
														sess = req.session;
														sess.error = 'Data Not Saved!(data base Error)';
														return res.redirect('/addproduct');
													}
												})
											})
										} else {
											console.log("error on catalog listing ::::::::::::::::::::::: ", err);
											sess = req.session;
											sess.error = 'Data Not Saved!(catalog Not Found!!)';
											return res.redirect('/addproduct');
										}
									})
								})
							} else {
								sess = req.session;
								sess.error = 'Catalog not Selected!';
								return res.redirect('/addproduct');
							}
							//	}
							//	})
						}
					} else {
						if (typeof req.body.productId != 'undefined' && req.body.productId != '') {

							webHandler.updateProductDetails(req.body, '', (done) => {
								return res.redirect('/productlist/1');
							})

						} else {
							sess = req.session;
							sess.error = 'Product Image Not Uploaded!';
							return res.redirect('/addproduct');
						}
					}
				})
			} else {
				return res.redirect('/');
			}
		})
		router.get('/deleteProduct/:id', (req, res) => {
			sess = req.session;
			sess.active = 'deleteProduct';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('products').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 200
						});
					} else {
						return res.send({
							error: true,
							status: 500
						});
					}
				})
			} else {
				res.redirect('/');
			}
		})

		// getImpsUploadData
		router.get('/api/getImpsUploadData', (req, res) => {
			db.collection('reseller').find({
				_id: new MongoId(req.query.id)
			}).toArray((err, resellerResults) => {
				db.collection('resellerimps').find({
					resellerId: req.query.id
				}).toArray((err, impsResults) => {
					if (resellerResults.length && impsResults.length) {
						res.send({
							error: 'N',
							data: {
								name: resellerResults[0].name,
								id: impsResults[0]._id
							}
						});
					} else {
						res.send({
							error: 'Y',
							data: {}
						});
					}
				})
			})
		})
		router.get('/api/addresses', (req, res) => {
			c("req.query.resellerId :::::::::::::: ", req.query.resellerId);
			db.collection('addresses').find({
				resellerId: req.query.resellerId
			}).toArray((err, results) => {
				if (results.length) {
					res.send(results);
				} else {
					res.send([]);
				}
			})
		})
		router.post('/api/addresses', (req, res) => {
			console.log("body :::::: ", req.body);
			var address = {
				name: typeof req.body.name != 'undefined' ? req.body.name : '',
				phone_no: typeof req.body.phone_no != 'undefined' ? req.body.phone_no : '',
				building: typeof req.body.building != 'undefined' ? req.body.building : '',
				street: typeof req.body.street != 'undefined' ? req.body.street : '',
				city: typeof req.body.city != 'undefined' ? req.body.city : '',
				landmark: typeof req.body.landmark != 'undefined' ? req.body.landmark : '',
				state: typeof req.body.state != 'undefined' ? req.body.state : '',
				pincode: typeof req.body.pincode != 'undefined' ? req.body.pincode : ''
			};
			if (typeof req.query.id != 'undefined') {
				address.resellerId = req.query.id;
				db.collection('addresses').insert(address, (err, results) => {
					if (!err) {
						address._id = results.ops[0]._id.toString();
						res.send({
							error: 'N',
							data: address
						});
					} else {
						res.send({
							error: 'Y',
							msg: 'database error!'
						});
					}
				})
			} else {
				res.send({
					error: 'Y',
					msg: 'reseller not present!'
				});
			}
		})
		router.get('/api/senders', (req, res) => {
			c("req.query.resellerId :::::::::::::: ", req.query.resellerId);
			db.collection('sender').find({
				resellerId: req.query.resellerId
			}).toArray((err, results) => {
				if (results.length) {
					res.send(results);
				} else {
					res.send([]);
				}
			})
		})
		router.post('/api/senders', (req, res) => {
			console.log("body :::::: ", req.body);
			var address = {
				name: typeof req.body.name != 'undefined' ? req.body.name : '',
				phone_no: typeof req.body.phone_no != 'undefined' ? req.body.phone_no : '',
			};
			if (typeof req.query.id != 'undefined') {
				address.resellerId = req.query.id;
				db.collection('sender').insert(address, (err, results) => {
					if (!err) {
						address._id = results.ops[0]._id.toString();
						res.send({
							error: 'N',
							data: address
						});
					} else {
						res.send({
							error: 'Y',
							msg: 'database error!'
						});
					}
				})
			} else {
				res.send({
					error: 'Y',
					msg: 'reseller not present!'
				});
			}
		})

		router.get('/addorder', (req, res) => {
			sess = req.session;
			sess.active = 'addorder';
			var data = {
				error: false
			};
			if (typeof sess.error != 'undefined') {
				data.error = true;
				data.msg = sess.error;
				delete sess.error;
			}
			if (typeof sess.user != 'undefined') {
				data.data = [];
				webHandler.responseData('addorder.html', data, res);
			} else {
				res.redirect('/');
			}
		})

		router.post('/addorder', (req, res) => {
			sess = req.session;
			sess.active = 'addorder';
			console.log("req.body ::::: ", req.body);
			if (typeof sess.user != 'undefined') {
				if (typeof req.body.resellerSelectId == 'undefined' || typeof req.body.addressId == 'undefined' ||
					typeof req.body.senderId == 'undefined' || typeof req.body.paymentMethod == 'undefined' ||
					typeof req.body.totalAmount == 'undefined' ||
					typeof req.body.finalCollect == 'undefined' ||
					typeof req.body.totalprice == 'undefined' || typeof req.body.totalshippingcharge == 'undefined' ||
					typeof req.body.cod == 'undefined' ||
					req.body.suppliername == 'undefined' ||
					typeof req.body.product == 'undefined' || typeof req.body.qty == 'undefined' ||
					typeof req.body.productSize == 'undefined' || typeof req.body.perproductprice == 'undefined'

				) {

					sess = req.session;
					sess.error = 'Data Missing!';
					return res.redirect('/addorder');
				}
				db.collection('orderplace').find({}).limit(1).sort({
					created_at: -1
				}).toArray((err, orderResultss) => {
					var orderplace = {
						orderno: orderResultss.length ? orderResultss[0].orderno + 1 : 1000,
						resellerId: typeof req.body.resellerSelectId != 'undefined' ? req.body.resellerSelectId : '',
						addressId: typeof req.body.addressId != 'undefined' ? req.body.addressId : '',
						senderId: typeof req.body.senderId != 'undefined' ? req.body.senderId : '',
						paymentMethod: typeof req.body.paymentMethod != 'undefined' ? req.body.paymentMethod : '',
						imps: typeof req.body.imps != 'undefined' ? (req.body.imps != '') ? req.body.imps : 0 : 0,
						transactionId: typeof req.body.transactionId != 'undefined' ? req.body.transactionId : '',
						totalAmount: typeof req.body.totalAmount != 'undefined' ? req.body.totalAmount : 0,
						totalPrice: typeof req.body.totalprice != 'undefined' ? parseFloat(req.body.totalprice) : 0,
						cod: typeof req.body.cod != 'undefined' ? req.body.cod : 0,
						totalItemCount: typeof req.body.totalItemCount != 'undefined' ? req.body.totalItemCount : 0,
						shippingCharge: typeof req.body.totalshippingcharge != 'undefined' ? req.body.totalshippingcharge : 0,
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
					if (req.body.product.length) {
						for (var i = 0; i < req.body.product.length; i++) {

							var orderno = orderplace.orderno;
							var productId = req.body.product[i];
							var weight = typeof req.body.weight[i] != 'undefined' ? req.body.weight[i] : '';
							var ProductName = typeof req.body.productName[i] != 'undefined' ? req.body.productName[i] : '';
							var qty = typeof req.body.qty[i] != 'undefined' ? req.body.qty[i] : 0;
							var size = typeof req.body.productSize[i] != 'undefined' ? req.body.productSize[i] : 0;
							var image = typeof req.body.productimage[i] != 'undefined' ? req.body.productimage[i] : '';
							var pricePerProduct = typeof req.body.perproductprice[i] != 'undefined' ? req.body.perproductprice[i] : 0;

							orderplace.totalItemCount += parseInt(req.body.qty[i]);

							// var temp = [orderno, ProductName, qty, size, image, pricePerProduct, productId];
							var temp = {
								orderno: orderno,
								ProductName: ProductName,
								qty: qty,
								size: size,
								weight: weight,
								image: image,
								pricePerProduct: pricePerProduct,
								productId: productId,
								cartId: 0,
								created_at: new Date()
							};
							productDetails.push(temp);
						}

					} else {
						sess = req.session;
						sess.error = 'Product Data Missing!';
						return res.redirect('/addorder');
					}
					db.collection('addresses').find({
						_id: new MongoId(orderplace.addressId)
					}).toArray((err, results) => {
						if (results.length) {
							if (typeof results[0]['name'] != 'undefined') {
								orderplace.address += results[0]['name'];
							}
							if (typeof results[0]['building'] != 'undefined') {
								orderplace.address += ', ' + results[0]['building'];
							}
							if (typeof results[0]['street'] != 'undefined') {
								orderplace.address += ', ' + results[0]['street'];
							}
							if (typeof results[0]['city'] != 'undefined') {
								orderplace.address += ', ' + results[0]['city'];
							}
							if (typeof results[0]['landmark'] != 'undefined') {
								orderplace.address += ', ' + results[0]['landmark'];
							}
							if (typeof results[0]['state'] != 'undefined') {
								orderplace.address += ', ' + results[0]['state'];
							}
							if (typeof results[0]['pincode'] != 'undefined') {
								orderplace.address += ', ' + results[0]['pincode'];
							}
							if (typeof results[0]['phone_no'] != 'undefined') {
								orderplace.address += ', ' + results[0]['phone_no'];
							}
							db.collection('sender').find({
								_id: new MongoId(orderplace.senderId)
							}).toArray((err, results) => {
								if (typeof results[0]['name'] != 'undefined') {
									orderplace.senderDetails += results[0]['name'];
								}
								if (typeof results[0]['phone_no'] != 'undefined') {
									orderplace.senderDetails += ', ' + results[0]['phone_no'];
								}
								db.collection('orderplace').insertOne(orderplace, (err, results) => {
									db.collection('orderproducts').insertMany(productDetails, (err, results) => {
										res.redirect('/orderlist/1');
									})
								})
							})
						} else {
							sess = req.session;
							sess.error = 'Data not found on Selected Sender!';
							return res.redirect('/addorder');
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/orderlist/:page', (req, res) => {
			console.log("req ::::: ", req.query);
			sess = req.session;
			sess.active = 'orderlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;
			var cop = skip + 1;
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var wh = {};
				if (typeof req.query != 'undefined' && typeof req.query.id != 'undefined') {
					wh['status'] = parseInt(req.query.id);
				}
				db.collection('orderplace').count(wh, (err, totalOrderCounts) => {

					db.collection('orderplace').find(wh).skip(skip).limit(perPage).sort({
						created_at: -1
					}).toArray((err, results) => {
						if (results.length) {
							function temp(results, i, make, done) {
								if (typeof results[i] != 'undefined') {
									db.collection('manifestfiles').find({
										orderno: results[i].orderno
									}).toArray((err, maniResults) => {
										db.collection('orderproducts').find({
											orderno: results[i].orderno
										}).toArray((err, orderResults) => {
											results[i]['productDetails'] = orderResults;
											results[i].TrackingID = maniResults.length ? typeof maniResults[0].awbNumber != 'undefined' ? maniResults[0].awbNumber : '' : '';
											results[i].tokenNumber = maniResults.length ? typeof maniResults[0].tokenNumber != 'undefined' ? maniResults[0].tokenNumber : '' : '';
											make.push(results[i]);
											if (typeof results[++i] != 'undefined') {
												temp(results, i, make, done);
											} else {
												return done(make);
											}
										})
									})
								} else {
									if (typeof results[++i] != 'undefined') {
										temp(results, i, make, done);
									} else {
										return done(make);
									}
								}
							}
							temp(results, 0, [], (done) => {
								if (done) {
									data['data'] = done;
									data['cop'] = cop;
									data['current'] = page;
									data['pages'] = Math.ceil(totalOrderCounts / perPage);
									data['search'] = {
										by: typeof req.query != 'undefined' && typeof req.query.id != 'undefined' ? req.query.id : ''
									};

									for (var i = 0; i < data.data.length; i++) {
										data.data[i].created_at = _date(data.data[i].created_at).format('DD MMMM, YYYY HH:mm A');
										data.data[i].paymentMethod = typeof data.data[i].paymentMethod != 'undefined' ? data.data[i].paymentMethod == 0 ? 'ONLINE' : data.data[i].paymentMethod == 1 ? 'IMPS' : data.data[i].paymentMethod == 2 ? 'COD' : '-' : '';
										data.data[i].size = '';
										for (var j = 0; j < data.data[i].productDetails.length; j++) {
											data.data[i].size += typeof data.data[i].productDetails[j]['size'] != 'undefined' ? (j == 1) ? ', ' + data.data[i].productDetails[j]['size'] : data.data[i].productDetails[j]['size'] : '';
										}
									}
									c("data ::::::::::: orderlist list ", data);
									webHandler.responseData('orderlist.html', data, res);
								}
							})
						} else {
							data['data'] = [];
							data['cop'] = cop;
							data['current'] = page;
							data['pages'] = 0;
							data['search'] = {
								by: typeof req.query != 'undefined' && typeof req.query.id != 'undefined' ? req.query.id : ''
							};
							webHandler.responseData('orderlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		/*router.get('/orderlist/:page', (req,res)=>{
	  	sess = req.session;
	  	sess.active = 'orderlist';
			var perPage = 10;
	    var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
	    var skip = (perPage * page) - perPage;
	    var limit = "LIMIT "+skip+", "+perPage;
	    var cop = skip+1;
			if(typeof sess.user != 'undefined') {
					var data = {error: false};
					if(typeof sess.error != 'undefined'){
						data.error = true;
						data.msg = sess.error;
						delete sess.error;
					}
					db.collection('orderplace').count((err, totalOrderCounts)=>{

						db.collection('orderplace').find({}).skip(skip).limit(perPage).sort({created_at: -1}).toArray((err, results)=>{
							if(results.length){
								function temp(results, i, make, done){
									if(typeof results[i] != 'undefined'){
										db.collection('manifestfiles').find({orderno: results[i].orderno}).toArray((err, maniResults)=>{
											db.collection('orderproducts').find({orderno: results[i].orderno}).toArray((err, orderResults)=>{
												results[i]['productDetails'] = orderResults;
												results[i].TrackingID = maniResults.length ? typeof maniResults[0].awbNumber != 'undefined' ? maniResults[0].awbNumber : '' : '';
												results[i].tokenNumber = maniResults.length ? typeof maniResults[0].tokenNumber != 'undefined' ? maniResults[0].tokenNumber : '' : '';
												make.push(results[i]);
												if(typeof results[++i] != 'undefined'){
													temp(results, i, make, done);
												}else{
													return done(make);
												}
											})
										})
									}else{
										if(typeof results[++i] != 'undefined'){
											temp(results, i, make, done);
										}else{
											return done(make);
										}
									}
								}
								temp(results, 0, [], (done)=>{
									if(done){
										data['data'] = done;
										data['cop'] = cop;
										data['current'] = page;
										data['pages'] = Math.ceil(totalOrderCounts / perPage);
										data['search'] = {};

										for (var i = 0; i < data.data.length; i++) {
											data.data[i].created_at = _date(data.data[i].created_at).format('DD MMMM, YYYY HH:mm A');
											data.data[i].paymentMethod = typeof data.data[i].paymentMethod != 'undefined' ? data.data[i].paymentMethod == 0 ? 'ONLINE' : data.data[i].paymentMethod == 1 ? 'IMPS' : data.data[i].paymentMethod == 2 ? 'COD' : '-' : '';
											data.data[i].size = '';
											for (var j = 0; j < data.data[i].productDetails.length; j++) {
												data.data[i].size += typeof data.data[i].productDetails[j]['size'] != 'undefined' ? (j==1) ? ', '+data.data[i].productDetails[j]['size'] : data.data[i].productDetails[j]['size'] : '';
											}
										}
										c("data ::::::::::: orderlist list ",data);
							    	webHandler.responseData('orderlist.html', data, res);
									}
								})
							}else{
								data['data'] = [];
								data['cop'] = cop;
								data['current'] = page;
								data['pages'] = 0;
								data['search'] = {};
								webHandler.responseData('orderlist.html', data, res);
							}
						})
					})
			}else {
			  res.redirect('/');
			}
	  })*/
		router.post('/orderlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'orderlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;
			var cop = skip + 1;
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				console.log('req.body ::: ', req.body);
				var wh = {};
				if (typeof req.body.orderno != 'undefined' && req.body.orderno != '') {
					wh['$or'] = [{
						orderno: parseInt(req.body.orderno)
					}, {
						mobileno: req.body.orderno
					}, {
						resellerId: req.body.orderno
					}];
					if (req.body.orderno.length < 4) {
						wh['$or'].push({
							totalPrice: parseFloat(req.body.orderno)
						});
					}
				}
				if (typeof req.body.todate != 'undefined' && req.body.todate != '' && typeof req.body.fromdate != 'undefined' && req.body.fromdate != '') {
					wh['$and'] = [{
						created_at: {
							$gte: new Date(req.body.todate + ' 00:00:00')
						}
					}, {
						created_at: {
							$lte: new Date(req.body.fromdate + ' 23:59:59')
						}
					}]
				}
				if (typeof req.body.by != 'undefined' && req.body.by != '') {
					wh['status'] = parseInt(req.body.by);
				}
				if (typeof req.body.min != 'undefined' && req.body.min != '') {
					req.body.max = typeof req.body.max != 'undefined' && req.body.max != '' && req.body.max >= req.body.min ? req.body.max : req.body.min;
					if (typeof wh['$and'] != 'undefined') {
						wh['$and'].push({
							totalPrice: {
								$gte: parseFloat(req.body.min)
							}
						}, {
							totalPrice: {
								$lte: parseFloat(req.body.max)
							}
						});
					} else {
						wh['$and'] = [{
							totalPrice: {
								$gte: parseFloat(req.body.min)
							}
						}, {
							totalPrice: {
								$lte: parseFloat(req.body.max)
							}
						}];
					}
				}

				db.collection('orderplace').count((err, totalOrderCounts) => {

					db.collection('orderplace').find(wh).skip(skip).limit(perPage).sort({
						created_at: -1
					}).toArray((err, results) => {
						if (results.length) {
							function temp(results, i, make, done) {
								if (typeof results[i] != 'undefined') {
									db.collection('manifestfiles').find({
										orderno: results[i].orderno
									}).toArray((err, maniResults) => {
										db.collection('orderproducts').find({
											orderno: results[i].orderno
										}).toArray((err, orderResults) => {
											results[i]['productDetails'] = orderResults;
											results[i].TrackingID = maniResults.length ? typeof maniResults[0].awbNumber != 'undefined' ? maniResults[0].awbNumber : '' : '';
											results[i].tokenNumber = maniResults.length ? typeof maniResults[0].tokenNumber != 'undefined' ? maniResults[0].tokenNumber : '' : '';
											make.push(results[i]);
											if (typeof results[++i] != 'undefined') {
												temp(results, i, make, done);
											} else {
												return done(make);
											}
										})
									})
								} else {
									if (typeof results[++i] != 'undefined') {
										temp(results, i, make, done);
									} else {
										return done(make);
									}
								}
							}
							temp(results, 0, [], (done) => {
								if (done) {
									data['data'] = done;
									data['cop'] = cop;
									data['current'] = page;
									data['pages'] = Math.ceil(totalOrderCounts / perPage);
									data['search'] = req.body;
									for (var i = 0; i < data.data.length; i++) {
										data.data[i].created_at = _date(data.data[i].created_at).format('DD MMMM, YYYY HH:mm A');
										data.data[i].paymentMethod = typeof data.data[i].paymentMethod != 'undefined' ? data.data[i].paymentMethod == 0 ? 'ONLINE' : data.data[i].paymentMethod == 1 ? 'IMPS' : data.data[i].paymentMethod == 2 ? 'COD' : '-' : '';
										data.data[i].size = '';
										for (var j = 0; j < data.data[i].productDetails.length; j++) {
											data.data[i].size += typeof data.data[i].productDetails[j]['size'] != 'undefined' ? (j == 1) ? ', ' + data.data[i].productDetails[j]['size'] : data.data[i].productDetails[j]['size'] : '';
										}
									}
									c("data ::::::::::: orderlist list ", data);
									webHandler.responseData('orderlist.html', data, res);
								}
							})
						} else {
							data['data'] = [];
							data['cop'] = cop;
							data['current'] = page;
							data['pages'] = 0;
							data['search'] = req.body;
							webHandler.responseData('orderlist.html', data, res);
						}
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/api/AWBNumberSeriesGeneration', (req, res) => {
			var jsonData = {
				"BusinessUnit": "ECOM",
				"ServiceType": req.body.serviceType,
				"DeliveryType": req.body.deliveryType
			};
			_req({
				"url": ex.AWBNumberSeriesGeneration,
				"json": true,
				"method": "post",
				"body": jsonData,
				"headers": {
					"Content-Type": "application/json",
					"XBkey": ex.AccessFormat.XBkey
				}
			}, (err, httpResponse, body) => {

				if (typeof body.ReturnMessage != 'undefined' && body.ReturnMessage == 'Successful' &&
					typeof body.ReturnCode != 'undefined' && body.ReturnCode == 100 && typeof body.BatchID != 'undefined') {

					var batches = {
						batchId: body.BatchID,
						servicetype: req.body.serviceType,
						deliverytype: req.body.deliveryType,
						_ia: 1
					};
					db.collection('batches').insertOne(batches, (err, results) => {
						var jsonData = {
							"BusinessUnit": "ECOM",
							"ServiceType": req.body.serviceType,
							"BatchID": body.BatchID.toString()
						};
						console.log("json data for get serial :::::: ", jsonData);
						_req({
							"url": ex.GetAWBNumberGeneratedSeries,
							"json": true,
							"method": "post",
							"body": jsonData,
							"headers": {
								"Content-Type": "application/json",
								"XBkey": ex.AccessFormat.XBkey
							}
						}, (err, httpResponse, body) => {
							if (typeof body.ReturnMessage != 'undefined' && body.ReturnMessage == 'Successful' &&
								typeof body.ReturnCode != 'undefined' && body.ReturnCode == 100 &&
								typeof body.AWBNoSeries != 'undefined' && body.AWBNoSeries.length) {
								var awbnumbers = [];
								for (var i = 0; i < body.AWBNoSeries.length; i++) {
									awbnumbers.push({
										batchId: body.BatchID,
										awbnumber: body.AWBNoSeries[i]
									});
								}
								temp(awbnumbers, 0);

								function temp(awbnumbers, i) {
									db.collection('awbnumbers').insertOne(awbnumbers[i], (err, results) => {
										console.log("i ::::::: ", i);
										if (typeof awbnumbers[++i] != 'undefined') {
											temp(awbnumbers, i);
										} else {
											res.send(body);
										}
									})
								}

							} else {
								body.error = 'opration not done! for awb database!';
								res.send(body);
							}
						})
					})

				} else {
					body.error = 'opration not done! for batch database!';
					res.send(body);
				}
			})
		})
		router.post('/api/trackingDetails', (req, res) => {
			db.collection('manifestfiles').find({
				_id: new MongoId(req.body.id)
			}).toArray((err, results) => {
				console.log("results :::::: ", err, results);
				var jsonData = {
					"XBkey": ex.AccessFormat.XBkeyGet,
					TokenNumber: results[0].tokenNumber
				};
				console.log("results :::::::::::::::::::::::: json ::::::::: ", jsonData)
				_req({
					"url": ex.TokenTrackingDetails,
					"json": true,
					"method": "post",
					"body": jsonData
				}, (err, httpResponse, body) => {

					console.log("error :::::: ", err);
					console.log("body ::::::: ", body);
					res.send(body);

				})
			})
		})
		router.post('/api/orderTrackingDetails', (req, res) => {
			db.collection('orderplace').find({
				orderno: req.body.id
			}).toArray((err, results) => {
				if (results.length && typeof results[0].manifestfileId != 'undefined' && results[0].manifestfileId != null) {
					db.collection('manifestfiles').find({
						id: results[0].manifestfileId
					}).toArray((err, results) => {
						if (results.length && typeof results[0].awbNumber != 'undefined' && results[0].awbNumber != null) {
							console.log("results :::::: ", err, results);
							var jsonData = {
								"XBkey": ex.AccessFormat.XBkeyPost,
								AWBNo: results[0].awbNumber
							};
							console.log("results :::::::::::::::::::::::: json ::::::::: ", jsonData)
							_req({
								"url": ex.getShipmentSummaryDetails,
								"json": true,
								"method": "post",
								"body": jsonData
							}, (err, httpResponse, body) => {

								console.log("error :::::: ", err);
								console.log("body ::::::: ", body);
								var cb = {
									error: 'N',
									msg: '',
									data: []
								};

								if (body[0].AuthKey == 'Valid' && body[0].ShipmentSummary != null) {
									cb.data = body;
								}

								return res.send(cb);
							})
						} else {
							return res.send({
								error: 'Y',
								msg: 'mysql error',
								data: err
							});
						}
					})
				} else {
					return res.send({
						error: 'N',
						msg: 'manifestId not available',
						data: []
					});
				}
			})
		})
		router.post('/api/getShipmentSummaryDetails', (req, res) => {
			db.collection('manifestfiles').find({
				_id: new MongoId(req.body.id)
			}).toArray((err, results) => {
				console.log("results :::::: ", err, results);
				var jsonData = {
					"XBkey": ex.AccessFormat.XBkeyGet,
					AWBNo: results[0].awbNumber
				};
				console.log("results :::::::::::::::::::::::: json ::::::::: ", jsonData)
				_req({
					"url": ex.getShipmentSummaryDetails,
					"json": true,
					"method": "post",
					"body": jsonData
				}, (err, httpResponse, body) => {

					console.log("error :::::: ", err);
					console.log("body ::::::: ", body);
					res.send(body);

				})
			})
		})
		router.get('/actionOrderPlace/:id/:type', (req, res) => {
			sess = req.session;
			sess.active = 'orderlist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var status = req.params.type == '1' ? 1 : req.params.type == '0' ? 2 : 0;
				db.collection('orderplace').update({
					_id: new MongoId(req.params.id)
				}, {
					$set: {
						status: status
					}
				}, (err, results) => {
					if (!err) {
						if (status == 1) {
							db.collection('orderplace').find({
								_id: new MongoId(req.params.id)
							}).toArray((err, results) => {
								db.collection('orderproducts').find({
									orderno: parseInt(results[0].orderno)
								}).toArray((err, orderproducts) => {
									var findCat = {};
									var or = [];
									for (var i = 0; i < orderproducts.length; i++) {
										if (orderproducts.length > 1) {
											or.push({
												_id: new MongoId(orderproducts[i].cartId)
											});
										} else {
											findCat = {
												_id: new MongoId(orderproducts[i].cartId)
											};
										}
									}
									if (or.length) {
										findCat['$or'] = or;
									}
									db.collection('categories').find(findCat).toArray((err, catresults) => {
										var deliverytype = results[0].paymentMethod == '0' || results[0].paymentMethod == 0 || results[0].paymentMethod == '1' || results[0].paymentMethod == 1 ? 'PREPAID' : 'COD';
										db.collection('addresses').find({
											_id: new MongoId(results[0].addressId)
										}).toArray((err, addresults) => {
											db.collection('batches').find({
												servicetype: 'FORWARD',
												deliverytype: deliverytype,
												_ia: 1
											}).toArray((err, batchresults) => {
												db.collection('awbnumbers').find({
													id: batchresults[0].trackpoint
												}).toArray((err, awbresults) => {
													var jsonData = ex._af;
													jsonData.ManifestDetails = {
														"ManifestID": new MongoId().toString(),
														"OrderType": results[0].paymentMethod == '0' || results[0].paymentMethod == 0 || results[0].paymentMethod == '1' || results[0].paymentMethod == 1 ? "Prepaid" : "COD",
														"OrderNo": results[0].orderno,
														"PaymentStatus": results[0].paymentMethod == '0' || results[0].paymentMethod == 0 || results[0].paymentMethod == '1' || results[0].paymentMethod == 1 ? "Prepaid" : "COD",

														"PickupVendor": "Sun Fashion Supply",
														"PickVendorPhoneNo": "9820927720",
														"PickVendorAddress": "D-164 New textile market Near RKTM Ring Road Surat",
														"PickVendorCity": "Surat",
														"PickVendorState": "Gujarat",
														"PickVendorPinCode": 395002,

														"CustomerName": addresults[0].name,
														"CustomerCity": addresults[0].city,
														"CustomerState": addresults[0].state,
														"ZipCode": addresults[0].pincode,
														"CustomerAddressDetails": [{
															"Type": "Primary",
															"Address": results[0].address
														}],
														"CustomerMobileNumberDetails": [{
															"Type": "Primary",
															"MobileNo": typeof results[0].senderDetails.split(',')[1] != 'undefined' ? results[0].senderDetails.split(',')[1].toString().trim() : ''
														}],
														"VirtualNumber": results[0].resellerId,
														"RTOName": "Sun Fashion",
														"RTOMobileNo": "9820927720",
														"RTOAddress": "D-164 New textile market Near RKTM Ring Road Surat",
														"RTOToCity": "Surat",
														"RTOToState": "Gujarat",
														"RTOPinCode": "395002",
														"AirWayBillNO": awbresults[0]['awbnumber'],
														"ServiceType": "SD",
														"Quantity": results[0].totalItemCount,

														"PickupVendorCode": "M34",
														"PickupType": "Vendor",

														"IsDGShipmentType": "0",
														"IsOpenDelivery": "0",

														//"CollectibleAmount": results[0].finalCollect,
														"CollectibleAmount": results[0].paymentMethod == '0' || results[0].paymentMethod == 0 || results[0].paymentMethod == '1' || results[0].paymentMethod == 1 ? 0 : results[0].finalCollect,
														"DeclaredValue": results[0].finalCollect,

														"GSTMultiSellerInfo": [{

															"ProductDesc": orderproducts.length ? typeof orderproducts[0].ProductName != 'undefined' ? orderproducts[0].ProductName : '' : '',
															"ProductCategory": catresults.length ? typeof catresults[0].name != 'undefined' ? catresults[0].name : '' : '',
															"SellerName": "SUN Fashion",
															"SellerAddress": "D-164 New textile market Near RKTM Ring Road Surat",
															"SupplySellerStatePlace": "Gujarat",
															"SellerPincode": 395002,
															"InvoiceDate": _date(new Date()).format('DD-MM-YYYY'),
															"HSNCode": "H3434",
															"TaxableValue": 0
														}]
													};
													console.log("ex.forwardManifest ::::: ", ex.forwardManifest);
													_req({
														"url": ex.forwardManifest,
														"json": true,
														"method": "post",
														"body": jsonData
													}, (err, httpResponse, body) => {
														console.log("error :::::: ", err);
														console.log("body :::::: ", body);
														var saveManifestDetails = {
															manifestId: jsonData.ManifestDetails.ManifestID,
															orderno: jsonData.ManifestDetails.OrderNo,
															manifestdetails: JSON.stringify(jsonData.ManifestDetails),
															awbNumber: body.AddManifestDetails ? body.AddManifestDetails[0].AuthKey == 'Valid' ? body.AddManifestDetails[0].AWBNo : '' : '',
															tokenNumber: body.AddManifestDetails ? body.AddManifestDetails[0].AuthKey == 'Valid' ? body.AddManifestDetails[0].TokenNumber : '' : '',
															returnMessage: body.AddManifestDetails ? body.AddManifestDetails[0].AuthKey == 'Valid' ? body.AddManifestDetails[0].ReturnMessage : '' : ''
														};
														console.log("saveManifestDetails :::: ", saveManifestDetails);
														db.collection('manifestfiles').insertOne(saveManifestDetails, (err, results) => {
															db.collection('orderplace').update({
																'_id': new MongoId(req.params.id)
															}, {
																$set: {
																	manifestfileId: results.ops[0]._id
																}
															}, (err, results) => {
																db.collection('batches').update({
																	_ia: 1,
																	deliverytype: deliverytype,
																	servicetype: 'FORWARD'
																}, {
																	$inc: {
																		trackpoint: 1
																	}
																}, (err, results) => {
																	return res.send({
																		error: true,
																		status: 200
																	});
																})
															})
														})
													})
												})
											})
										})
									})
								})
							})
						}
					}
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/deleteOrderPlace/:id', (req, res) => {
			sess = req.session;
			sess.active = 'orderlist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('orderplace').findOne({
					_id: new MongoId(req.params.id)
				}, (err, orderresults) => {
					db.collection('orderplace').remove({
						_id: new MongoId(req.params.id)
					}, (err, results) => {
						db.collection('orderproducts').remove({
							orderno: orderresults.orderno
						}, (err, results) => {
							if (!err) {
								return res.send({
									error: true,
									status: 200
								});
							} else {
								return res.send({
									error: true,
									status: 500
								});
							}
						})
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/api/getSingleOrderDetails', (req, res) => {

			if (typeof req.body.orderno == 'undefined') {
				return res.send({
					error: 'Y',
					msg: 'data not valid'
				});
			}
			console.log("req.body.orderno ::::: ", req.body.orderno);
			db.collection('orderplace').find({
				orderno: parseInt(req.body.orderno)
			}).toArray((err, results) => {
				db.collection('addresses').find({
					_id: new MongoId(results[0].addressId)
				}).toArray((err, addresults) => {
					db.collection('destination_code').find({
						pincode: addresults[0].pincode
					}).toArray((err, desresults) => {
						db.collection('orderproducts').find({
							orderno: parseInt(req.body.orderno)
						}).toArray((err, productresults) => {
							db.collection('manifestfiles').find({
								orderno: parseInt(req.body.orderno)
							}).toArray((err, manifestfiles) => {
								results[0].created_at = _date(results[0].created_at).format('DD MMMM, YYYY HH:mm A');
								results[0].destinationCode = desresults.length ? typeof desresults[0].area_code ? desresults[0].area_code : '' : '';
								results[0].productDetails = productresults;
								results[0].awbNumber = manifestfiles.length ? typeof manifestfiles[0]['awbNumber'] != 'undefined' ? manifestfiles[0]['awbNumber'] : '' : '';
								return res.send({
									error: 'N',
									'data': results[0]
								});
							})
						})
					})
				})
			})
		})
		router.post('/api/getOrderImpsDetails', (req, res) => {
			db.collection('orderplace').find({
				orderno: parseInt(req.body.orderno)
			}).toArray((err, results) => {
				db.collection('resellerimps').find({
					_id: new MongoId(results[0].imps)
				}).toArray((err, results) => {
					console.log("results :::::: ", err, results);
					res.send({
						error: 'N',
						data: results
					});
				})
			})
		})

		router.get('/addbanner', (req, res) => {
			sess = req.session;
			sess.active = 'addbanner';
			if (typeof sess.user != 'undefined') {
				webHandler.responseData('addbanner.html', {
					error: false
				}, res);
			} else {
				res.redirect('/');
			}
		})
		router.get('/bannerlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'bannerlist';
			if (typeof sess.user != 'undefined') {
				webHandler.responseData('bannerlist.html', {
					error: false
				}, res);
			} else {
				res.redirect('/');
			}
		})
		router.post('/addbanner', (req, res) => {
			sess = req.session;
			sess.active = 'addbanner';
			if (typeof sess.user != 'undefined') {
				webHandler.responseData('addbanner.html', {
					error: false
				}, res);
			} else {
				res.redirect('/');
			}
		})
		router.post('/api/updateMyvendorProfile', (req, res) => {
			files.vendorUpload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					return res.send({
						error: 'Y',
						msg: err.code
					});
				} else if (err) {
					// An unknown error occurred when uploading.
					return res.send({
						error: 'Y',
						msg: err.code
					});
				}
				if (typeof req.body.vendorId == 'undefined') {
					return res.send({
						error: 'Y',
						msg: 'parameter invalid',
						data: req.body
					});
				}
				if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
					var vendorData = {
						profile: BaseUrl + '/public/vendor/' + req.file.filename
					};
				} else {
					vendorData = {};
				}

				if (typeof req.body.name != 'undefined') {
					vendorData.name = req.body.name;
				}
				if (typeof req.body.mobile1 != 'undefined') {
					vendorData.contactno = req.body.mobile1;
				}
				db.collection('vendor').find({
					_id: new MongoId(req.body.vendorId)
				}).toArray((err, results) => {
					if (results.length) {
						db.collection('vendor').update({
							_id: new MongoId(req.body.vendorId)
						}, {
							$set: vendorData
						}, (err, results) => {
							if (!err) {
								return res.send({
									error: 'N',
									'msg': 'vendorData successfully added!',
									data: vendorData
								});
							} else {
								return res.send({
									error: 'Y',
									msg: 'mysql error',
									data: error
								});
							}
						})
					}
				})
			})
		});
		router.post('/api/addorUpdatebankDetailsForVendor', (req, res) => {

			if (typeof req.body.vendorId == 'undefined' || req.body.vendorId == '' || typeof req.body.bankname == 'undefined' || req.body.bankname == '' || typeof req.body.accountname == 'undefined' || req.body.accountname == '' ||
				typeof req.body.accountno == 'undefined' || req.body.accountno == '' || typeof req.body.ifsc == 'undefined' || req.body.ifsc == '') {
				return res.send({
					error: 'Y'
				});
			} else {
				var updatable = {
					bankname: req.body.bankname,
					accountname: req.body.accountname,
					accountno: req.body.accountno,
					ifsc: req.body.ifsc
				};
				console.log("updatable ::::::", updatable);
				db.collection('vendor').update({
					_id: new MongoId(req.body.vendorId)
				}, {
					$set: updatable
				}, (err, results) => {
					res.send(200);
				})
			}
		})
		router.get('/vendorProfile', (req, res) => {
			sess = req.session;
			sess.active = 'vendorlist';
			var perPage = 10;
			var page = (typeof req.query.pn != 'undefined') ? (req.query.pn == 0) ? 1 : req.query.pn || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('vendor').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, Results) => {
						db.collection('catalogs').count({
							vendorId: req.query.id
						}, (err, catalogCount) => {
							db.collection('catalogs').find({
								vendorId: req.query.id
							}).skip(skip).limit(perPage).toArray((err, catalogResults) => {
								data['vendor'] = Results[0];
								for (var i = 0; i < catalogResults.length; i++) {
									catalogResults[i].created_at = _date(catalogResults[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
								}
								data['catalogs'] = catalogResults;
								data['ccurrent'] = page;
								data['cpages'] = Math.ceil(catalogCount / perPage);

								var wh = {
									vendorId: req.query.id
								};
								var cop = skip + 1;
								db.collection('orderplace').count(wh, (err, totalOrderCounts) => {
									db.collection('orderplace').find(wh).skip(skip).limit(perPage).sort({
										created_at: -1
									}).toArray((err, results) => {
										if (results.length) {
											function temp(results, i, make, done) {
												if (typeof results[i] != 'undefined') {
													db.collection('manifestfiles').find({
														orderno: results[i].orderno
													}).toArray((err, maniResults) => {
														db.collection('orderproducts').find({
															orderno: results[i].orderno
														}).toArray((err, orderResults) => {
															results[i]['productDetails'] = orderResults;
															results[i].TrackingID = maniResults.length ? typeof maniResults[0].awbNumber != 'undefined' ? maniResults[0].awbNumber : '' : '';
															results[i].tokenNumber = maniResults.length ? typeof maniResults[0].tokenNumber != 'undefined' ? maniResults[0].tokenNumber : '' : '';
															make.push(results[i]);
															if (typeof results[++i] != 'undefined') {
																temp(results, i, make, done);
															} else {
																return done(make);
															}
														})
													})
												} else {
													if (typeof results[++i] != 'undefined') {
														temp(results, i, make, done);
													} else {
														return done(make);
													}
												}
											}
											temp(results, 0, [], (done) => {
												if (done) {
													data['order'] = done;
													data['cop'] = cop;
													data['ocurrent'] = page;
													data['opages'] = Math.ceil(totalOrderCounts / perPage);
													data['search'] = {
														by: typeof req.query != 'undefined' && typeof req.query.id != 'undefined' ? req.query.id : ''
													};

													for (var i = 0; i < data['order'].length; i++) {
														data['order'][i].created_at = _date(data['order'][i].created_at).format('DD MMMM, YYYY HH:mm A');
														data['order'][i].paymentMethod = typeof data['order'][i].paymentMethod != 'undefined' ? data['order'][i].paymentMethod == 0 ? 'ONLINE' : data['order'][i].paymentMethod == 1 ? 'IMPS' : data['order'][i].paymentMethod == 2 ? 'COD' : '-' : '';
														data['order'][i].size = '';
														for (var j = 0; j < data['order'][i].productDetails.length; j++) {
															data['order'][i].size += typeof data['order'][i].productDetails[j]['size'] != 'undefined' ? (j == 1) ? ', ' + data['order'][i].productDetails[j]['size'] : data['order'][i].productDetails[j]['size'] : '';
														}
													}
													c("data ::::::::::: orderlist list ", data);
													webHandler.responseData('vendorprofile.html', data, res);
												}
											})
										} else {
											data['order'] = [];
											data['cop'] = cop;
											data['ocurrent'] = page;
											data['opages'] = 0;
											data['search'] = {
												by: typeof req.query != 'undefined' && typeof req.query.id != 'undefined' ? req.query.id : ''
											};
											webHandler.responseData('vendorprofile.html', data, res);
										}
									})
								})
							})
						})
					})
				} else {
					res.redirect('/');

				}
			} else {
				res.redirect('/');
			}
		})
		router.get('/resellerProfile', (req, res) => {
			sess = req.session;
			sess.active = 'resellerlist';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('reseller').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, resellerResults) => {
						db.collection('sender').find({
							resellerId: req.query.id
						}).toArray((err, senderResults) => {
							db.collection('bankdetails').find({
								resellerId: req.query.id
							}).toArray((err, bankdetailsResults) => {
								db.collection('addresses').find({
									resellerId: req.query.id
								}).toArray((err, addressesResults) => {
									db.collection('orderplace').count({
										resellerId: req.query.id
									}, (err, totalOrders) => {
										db.collection('orderplace').count({
											resellerId: req.query.id,
											status: 2
										}, (err, cancelOrders) => {
											db.collection('orderplace').count({
												resellerId: req.query.id,
												status: 0
											}, (err, pendingOrders) => {
												db.collection('cart').count({
													resellerId: req.query.id
												}, (err, catResults) => {
													data.data = resellerResults[0];
													data.data['senderDetails'] = typeof senderResults != 'undefined' ? senderResults : {};
													data.data['accountno'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0].accountno != 'undefined' ? bankdetailsResults[0].accountno : '' : '';
													data.data['accountname'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0].accountname != 'undefined' ? bankdetailsResults[0].accountname : '' : '';
													data.data['bankId'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0]._id != 'undefined' ? bankdetailsResults[0]._id : '' : '';
													data.data['bankname'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0].bankname != 'undefined' ? bankdetailsResults[0].bankname : '' : '';
													data.data['ifsc'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0].ifsc != 'undefined' ? bankdetailsResults[0].ifsc : '' : '';
													data.data['image'] = typeof bankdetailsResults[0] != 'undefined' ? typeof bankdetailsResults[0].image != 'undefined' ? bankdetailsResults[0].image : '' : '';
													data.data['addresses'] = typeof addressesResults != 'undefined' ? addressesResults : [];
													data.data['reseller'] = resellerResults[0];
													data.data['totals'] = {
														totalOrders: totalOrders,
														cancelOrders: cancelOrders,
														pendingOrders: pendingOrders,
														totalCart: catResults
													};
													console.log("data ::::: ", data);
													webHandler.responseData('resellerprofile.html', data, res);
												})
											})
										})
									})
								})
							})
						})
					})
				} else {
					data.data = {};
					webHandler.responseData('addreseller.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})
		router.post('/api/updateMyProfile', (req, res) => {
			files.resellerUpload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					res.send({
						error: 'Y',
						msg: e.code
					});
				} else if (err) {
					// An unknown error occurred when uploading.
					res.send({
						error: 'Y',
						msg: e.code
					});
				}
				if (typeof req.body.resellerId == 'undefined') {
					return res.send({
						error: 'Y',
						msg: 'parameter invalid',
						data: req.body
					});
				}
				if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
					var resellerData = {
						profile: BaseUrl + '/public/reseller/' + req.file.filename
					};
				} else {
					resellerData = {};
				}

				if (typeof req.body.name != 'undefined') {
					resellerData.name = req.body.name;
				}
				if (typeof req.body.address != 'undefined') {
					resellerData.address = req.body.address;
				}
				if (typeof req.body.email != 'undefined') {
					resellerData.email = req.body.email;
				}
				if (typeof req.body.password != 'undefined') {
					resellerData.password = req.body.password;
				}
				if (typeof req.body.mobile1 != 'undefined') {
					resellerData.mobile1 = req.body.mobile1;
				}
				if (typeof req.body.mobile2 != 'undefined') {
					resellerData.mobile2 = req.body.mobile2;
				}
				db.collection('reseller').find({
					_id: new MongoId(req.body.resellerId)
				}).toArray((err, results) => {
					if (results.length) {
						db.collection('reseller').update({
							_id: new MongoId(req.body.resellerId)
						}, {
							$set: resellerData
						}, (err, results) => {
							if (!err) {
								res.send({
									error: 'N',
									'msg': 'resellerData successfully added!',
									data: resellerData
								});
							} else {
								return res.send({
									error: 'Y',
									msg: 'mysql error',
									data: error
								});
							}
						})
					}
				})
			})
		});
		router.get('/addreseller', (req, res) => {
			sess = req.session;
			sess.active = 'addreseller';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('reseller').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							data.data = results[0];
							db.collection('bankdetails').find({
								resellerId: req.query.id
							}).toArray((err, results) => {
								if (results.length) {
									data.data['accountno'] = results[0].accountno;
									data.data['accountname'] = results[0].accountname;
									data.data['bankname'] = results[0].bankname;
									data.data['ifsc'] = results[0].ifsc;
								}
								console.log("data ::::: ", data);
								webHandler.responseData('addreseller.html', data, res);
							})
						}
					})
				} else {
					data.data = {};
					webHandler.responseData('addreseller.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})
		router.post('/addreseller', (req, res) => {
			sess = req.session;
			sess.active = 'addreseller';
			if (typeof sess.user != 'undefined') {
				files.resellerUpload(req, res, function (err) {
					if (err instanceof multer.MulterError) {
						// A Multer error occurred when uploading.
						res.send(err);
					} else if (err) {
						// An unknown error occurred when uploading.
						res.send(err);
					}
					if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
						db.collection('reseller').find({
							mobile1: req.body.mobile1
						}).toArray((err, results) => {
							if (results.length) {
								if (typeof req.body.resellerId != 'undefined' && req.body.resellerId != '') {

									webHandler.updateResellerDetails(req.body, req.file.filename, (done) => {
										webHandler.updateBankDetails(req.body, (done) => {
											res.redirect('/resellerlist/1');
										})
									})

								} else {
									sess = req.session;
									sess.error = 'Data Not Saved Reseller Already Present into system!';
									res.redirect('/addreseller');
								}
							} else {
								var resellerData = {
									name: req.body.name,
									profile: BaseUrl + '/public/reseller/' + req.file.filename,
									mobile1: typeof req.body.mobile1 != 'undefined' ? req.body.mobile1 : 0,
									mobile2: typeof req.body.mobile2 != 'undefined' ? req.body.mobile2 : 0,
									address: typeof req.body.address != 'undefined' ? req.body.address : '',
									cod_ratio: 0,
									cod: 0,
									created_at: new Date(),
									updated_at: new Date(),
									payable_margin: 0,
									paid_margin: 0
								};
								db.collection('reseller').insertOne(resellerData, (err, results) => {
									if (err) {
										sess = req.session;
										sess.error = 'Data Not Saved!';
										res.redirect('/addreseller');
									} else {
										var bankDetails = {
											accountno: typeof req.body.account_number != 'undefined' ? req.body.account_number : '',
											accountname: typeof req.body.account_holder_name != 'undefined' ? req.body.account_holder_name : '',
											bankname: typeof req.body.bankname != 'undefined' ? req.body.bankname : '',
											resellerId: results.insertId,
											ifsc: typeof req.body.IFSC_code != 'undefined' ? req.body.IFSC_code : ''

										};
										db.collection('bankdetails').insertOne(bankDetails, (err, results) => {
											if (err) {
												console.log("error :::::::::::::::: bankdetails", error);
												sess = req.session;
												sess.error = 'Data Not Saved!';
												res.redirect('/addreseller');
											} else {
												res.redirect('/resellerlist/1');
											}
										})
									}
								})
							}
						})
					} else {
						if (typeof req.body.resellerId != 'undefined' && req.body.resellerId != '') {

							webHandler.updateResellerDetails(req.body, '', (done) => {
								webHandler.updateBankDetails(req.body, (done) => {
									res.redirect('/resellerlist/1');
								})
							})

						} else {
							sess = req.session;
							sess.error = 'Profile Image Not Uploaded!';
							res.redirect('/addreseller');
						}
					}
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/resellerlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'resellerlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('reseller').count((err, resellerCounts) => {
					db.collection('reseller').find({}).sort({
						created_at: -1
					}).skip(skip).limit(perPage).toArray((err, resellerresults) => {
						db.collection('config').find({}).toArray((err, results) => {
							for (var i = 0; i < resellerresults.length; i++) {
								resellerresults[i].created_at = _date(resellerresults[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
							}
							data['data'] = resellerresults;
							data['search'] = {};
							data['current'] = page;
							data['config'] = results[0];
							data['pages'] = Math.ceil(resellerCounts / perPage);
							console.log("data ::::::::::: ", data);

							function temp(resellerList, i, done) {
								db.collection('bankdetails').find({
									resellerId: resellerList[i]._id.toString()
								}).toArray((err, results) => {
									if (results.length) {
										resellerList[i]['bankDetails'] = results;
									} else {
										resellerList[i]['bankDetails'] = {};
									}
									if (typeof resellerList[++i] != 'undefined') {
										temp(resellerList, i, done);
									} else {
										return done(resellerList);
									}
								})
							}

							temp(resellerresults, 0, (done) => {
								data['data'] = done;
								c("data ::::::::::: resellerlist list ", done);
								webHandler.responseData('resellerlist.html', data, res);
							})

						})
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/resellerlist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'resellerlist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				var wh = {};
				if (req.body.search != '') {
					if (req.body.by != '') {
						if (req.body.by == 'name') {
							wh['name'] = {
								$regex: req.body.search,
								$options: '$i'
							};
						} else if (req.body.by == 'gst') {
							wh['GST_number'] = req.body.search;
						} else if (req.body.by == 'accountno') {
							wh['accountno'] = req.body.search;
						} else if (req.body.by == 'ifsc') {
							wh['ifsc'] = req.body.search;
						} else if (req.body.by == 'contact') {
							wh['$or'] = [{
								mobile1: req.body.search
							}, {
								mobile2: req.body.search
							}];
						} else if (req.body.by == 'id') {
							if (req.body.search.toString().trim().length == 24) {
								wh['_id'] = new MongoId(req.body.search.toString().trim());
							} else {
								wh['_id'] = new MongoId('000000000000000000000000');
							}
						} else if (req.body.by == 'cat' && req.body.categoriesId != '') {
							wh['categoriesId'] = parseInt(req.body.categoriesId);
						}
					}
				} else {
					if (req.body.by != '') {
						if (req.body.by == 'cat' && req.body.categoriesId != '') {
							wh['categoriesId'] = parseInt(req.body.categoriesId);
						}
					}
				}
				if (req.body.todate != '' && req.body.fromdate != '') {
					wh['$and'] = [{
						created_at: {
							$gte: new Date(req.body.todate + ' 00:00:00')
						}
					}, {
						created_at: {
							$lte: new Date(req.body.fromdate + ' 23:59:59')
						}
					}]
				}
				db.collection('reseller').count(wh, (err, resellerCounts) => {
					db.collection('reseller').find(wh).sort({
						created_at: -1
					}).skip(skip).limit(perPage).toArray((err, resellerresults) => {
						db.collection('config').find({}).toArray((err, results) => {
							for (var i = 0; i < resellerresults.length; i++) {
								resellerresults[i].created_at = _date(resellerresults[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
							}
							data['data'] = resellerresults;
							data['search'] = req.body;
							data['current'] = page;
							data['config'] = results[0];
							data['pages'] = Math.ceil(resellerCounts / perPage);
							console.log("data ::::::::::: ", data);

							function temp(resellerList, i, done) {
								if (typeof resellerList[i]._id != 'undefined') {
									db.collection('bankdetails').find({
										resellerId: resellerList[i]._id.toString()
									}).toArray((err, results) => {
										if (results.length) {
											resellerList[i]['bankDetails'] = results;
										} else {
											resellerList[i]['bankDetails'] = {};
										}
										if (typeof resellerList[++i] != 'undefined') {
											temp(resellerList, i, done);
										} else {
											return done(resellerList);
										}
									})
								} else {
									if (typeof resellerList[++i] != 'undefined') {
										temp(resellerList, i, done);
									} else {
										return done(resellerList);
									}
								}
							}
							if (resellerresults.length) {
								temp(resellerresults, 0, (done) => {
									data['data'] = done;
									c("data ::::::::::: resellerlist list ", done);
									webHandler.responseData('resellerlist.html', data, res);
								})
							} else {
								data['data'] = [];
								webHandler.responseData('resellerlist.html', data, res);
							}

						})
					})
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/getResellerMarginData/:resellerId', (req, res) => {
			if (typeof req.params.resellerId != 'undefined') {
				db.collection('orderplace').find({
					resellerId: req.params.resellerId,
					margin: {
						$gt: 0
					}
				}).toArray((err, results) => {
					res.send(results);
				})
			} else {
				res.send([]);
			}
		})
		router.post('/uploadmarginform', (req, res) => {
			console.log("req. body ::::::::::: ", req.body);
			files.marginUpload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					console.log("err ::::::::::::::: ", err);
					res.send({
						error: 'Y',
						'msg': 'File Uploading Error!'
					});
				} else if (err) {
					// An unknown error occurred when uploading.
					console.log("err ::::::::::::::: ", err);
					res.send({
						error: 'Y',
						'msg': 'File Uploading Error!'
					});
				}
				if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined' && typeof req.body.resellerId != 'undefined' && req.body.resellerId.trim() != '') {
					try {
						var orders = JSON.parse(req.body.jsonOrders);
					} catch (e) {
						console.log("req.body ::::::::::::::::::::::::::::", req.body);
						res.send({
							error: 'N',
							'msg': 'Order ID Not Valid!'
						});
						return true;
					}
					var ordersId = [];
					for (var order in orders) {
						ordersId.push(order);
					}

					db.collection('orderplace').find({
						orderno: {
							$in: ordersId
						}
					}).toArray((err, results) => {
						if (results.length) {
							var marginDetails = {
								resellerId: req.body.resellerId,
								image: BaseUrl + '/public/margin/' + req.file.filename,
								ordernos: ordersId,
								paidmargin: parseInt(req.body.totalMargin),
								orderCounts: ordersId.length
							};
							db.collection('resellermagindetails').insertOne(marginDetails, (err, marginResults) => {
								if (!err) {
									db.collection('orderplace').update({
										orderno: {
											$in: ordersId
										}
									}, {
										$set: {
											margin: 0,
											marginImage: marginDetails.image
										}
									}, (err, orderupdate) => {
										if (!err) {
											db.collection('reseller').update({
												_id: new MongoId(req.body.resellerId)
											}, {
												$inc: {
													payable_margin: -marginDetails.paidmargin
												},
												$set: {
													paid_margin: marginDetails.paidmargin
												}
											}, (err, results) => {
												res.send({
													error: 'N',
													'msg': 'Margin successfully added!'
												});
											})
										} else {
											return res.send({
												error: 'Y',
												msg: 'database error!',
												data: err
											});
										}
									})
								} else {
									return res.send({
										error: 'Y',
										msg: 'database error!',
										data: err
									});
								}
							})
						} else {
							return res.send({
								error: 'Y',
								msg: 'database error!',
								data: err
							});
						}
					})
				} else {
					res.send({
						error: 'Y',
						'msg': 'File Uploading Error or Reseller ID not Found!'
					});
				}
			})
		})
		router.get('/deleteReseller/:id', (req, res) => {
			sess = req.session;
			sess.active = 'resellerlist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('reseller').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 200
						});
					} else {
						return res.send({
							error: true,
							status: 500
						});
					}
				})
			} else {
				res.redirect('/resellerlist/1');
			}
		})
		router.get('/changeCodStatus/:resellerId/:status', (req, res) => {
			console.log("req.params.resellerId :::::: ", req.params.resellerId, req.params.status)
			if (typeof req.params.resellerId != 'undefined' && typeof req.params.status != 'undefined') {
				db.collection('reseller').update({
					resellerId: req.params.resellerId
				}, {
					$set: {
						cod: parseInt(req.params.status)
					}
				}, (err, results) => {
					console.log("changeCodStatus ::::: error :::::::: ", err);
					var data = {
						status: req.params.status == '0' ? 'inactive' : 'active'
					};
					return res.send(JSON.stringify(data));
				})
			} else {
				res.send(400);
			}
		})
		router.get('/changeCatalogStatus/:catalogId/:status', (req, res) => {
			console.log("req.params.catalogId :::::: ", req.params.catalogId, req.params.status)
			if (typeof req.params.catalogId != 'undefined' && typeof req.params.status != 'undefined') {
				db.collection('catalogs').update({
					_id: new MongoId(req.params.catalogId)
				}, {
					$set: {
						_ia: parseInt(req.params.status)
					}
				}, (err, results) => {
					console.log("changeCodStatus ::::: error :::::::: ", err);
					var data = {
						status: req.params.status == '0' ? 'inactive' : 'active'
					};
					return res.send(JSON.stringify(data));
				})
			} else {
				res.send(400);
			}
		})
		router.get('/changeAllCodStatus/:status', (req, res) => {
			console.log("req.params.resellerId :::::: ", req.params.status)
			if (typeof req.params.status != 'undefined') {
				db.collection('config').update({
					id: 1
				}, {
					$set: {
						cod: parseInt(req.params.status)
					}
				}, (err, results) => {
					console.log("changeCodStatus ::::: error :::::::: ", err);
					var data = {
						status: req.params.status == '0' ? 'inactive' : 'active'
					};
					return res.send(JSON.stringify(data));
				})
			} else {
				res.send(400);
			}
		})

		router.get('/sendNotification', (req, res) => {
			sess = req.session;
			sess.active = 'addcatalog';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('catalogs').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							console.log("data ::::: ", results[0]);
							var registrationToken = []
							registrationToken.push('fKgpfOeUfRo:APA91bH9JakTNQnlAJKVIGw_QNaiBUAgfsHFiOyHiL_sO5beXm0Hy7jfo_4KCC9D8aYkFHhOW3ejVINehcQ9CW3wJ-PDEzuCHg8H8QEZoBPQnGZkt4_12XWa5GFDM6eSt3CdEy6NlQ9j');

							var payload = {
								notification: {
									// title: req.body.title,
									// body: req.body.msg
									title: results[0].name,
									body: results[0].description
								}
							};

							var options = {
								priority: "high",
								timeToLive: 60 * 60 * 24
							};

							db.collection('reseller').find({}).toArray((err, reseller) => {
								if (reseller.length) {
									for (var i = 0; i < reseller.length; i++) {
										if (reseller[i].firebaseToken !== undefined && reseller[i].firebaseToken !== '') {
											// console.log(reseller[i].firebaseToken);
											// registrationToken.push(reseller[i].firebaseToken);
											var token = reseller[i].firebaseToken;
											admin.messaging().sendToDevice(token, payload, options)
												.then(function (response) {
													console.log("Successfully sent message:", response);
												})
												.catch(function (error) {
													console.log("Error sending message:", error);
												});

										}
									}
									res.redirect('/cataloglist/1');
								}
							})
							//    webHandler.responseData('addcatalog.html', data, res);
						}
					})
				}
			} else {
				res.redirect('/');
			}
		})

		router.get('/addcatalog', (req, res) => {
			sess = req.session;
			sess.active = 'addcatalog';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				if (typeof req.query.id != 'undefined') {
					db.collection('catalogs').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						if (results.length) {
							data.data = results[0];
							console.log("data ::::: ", data);
							webHandler.responseData('addcatalog.html', data, res);
						}
					})
				} else {
					data.data = {};
					webHandler.responseData('addcatalog.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})


		router.post('/addcatalog', (req, res) => {
			console.log('why this happen 1.1')
			sess = req.session;
			sess.active = 'addcatalog';
			if (typeof sess.user != 'undefined') {
				files.catalogUpload(req, res, function (err) {
					if (err instanceof multer.MulterError) {
						// A Multer error occurred when uploading.
						res.send(err);
					} else if (err) {
						// An unknown error occurred when uploading.
						res.send(err);
					}
					if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
						db.collection('catalogs').find({
							name: req.body.name
						}).toArray((err, results) => {
							if (results.length) {
								if (typeof req.body.catalogId != 'undefined' && req.body.catalogId != '' && req.body.catalogId == results[0]._id) {
									console.log('why this happen 1.2')
									webHandler.updateCatalogDetails(req.body, req.file.filename, (done) => {
										res.redirect('/cataloglist/1');
									})
								} else {
									sess = req.session;
									sess.error = 'Data Not Saved Catalog Already Present into system!';
									if (typeof req.body.catalogId != 'undefined' && req.body.catalogId != '') {
										res.redirect('/addcatalog?id=' + req.body.catalogId);
									} else {
										res.redirect('/addcatalog');
									}
								}
							} else if (typeof req.body.catalogId != 'undefined' && req.body.catalogId != '') {
								webHandler.updateCatalogDetails(req.body, req.file.filename, (done) => {
									res.redirect('/cataloglist/1');
								})
							} else {
								db.collection('catalogs').find({}).sort({
									_id: -1
								}).toArray((err, lastCatalog) => {
									var newID = parseInt(lastCatalog[0].id) + 1;
									if (newID.toString().length > 3) {
										newID = newID.toString();
									} else {
										newID = '0' + newID;
									}
									var catalogData = {
										catalogID: 'catalog#' + new MongoId().toString(),
										vendorId: req.body.vendorId,
										name: req.body.name,
										price: typeof req.body.price != 'undefined' ? req.body.price : '',
										description: typeof req.body.description != 'undefined' ? req.body.description : 0,
										notes: typeof req.body.notes != 'undefined' ? req.body.notes : '',
										categoriesId: typeof req.body.categoriesId != 'undefined' ? parseInt(req.body.categoriesId) : '',
										created_at: new Date(),
										_ia: 0,
										id: newID,
										catalog_image: 'public/catalogs/' + req.file.filename
									};
									db.collection('catalogs').insertOne(catalogData, (err, results) => {
										if (err) {
											sess = req.session;
											sess.error = 'Data Not Saved!';
											res.redirect('/addcatalog');
										} else {
											res.redirect('/cataloglist/1');
										}
									})

								});
							}
						})
					} else {
						console.log(req.body)
						if (typeof req.body.catalogId != 'undefined' && req.body.catalogId != '') {
							db.collection('catalogs').find({
								name: req.body.name
							}).toArray((err, results) => {
								if (results.length) {
									if (req.body.catalogId == results[0]._id) {
										console.log('why this happen 1.3')
										webHandler.updateCatalogDetails(req.body, '', (done) => {
											res.redirect('/cataloglist/1');
										})
									} else {
										sess = req.session;
										sess.error = 'Data Not Saved Catalog Already Present into system!';
										res.redirect('/addcatalog?id=' + req.body.catalogId);
									}
								} else {
									webHandler.updateCatalogDetails(req.body, '', (done) => {
										res.redirect('/cataloglist/1');
									})
								}
							});
							//	webHandler.updateCatalogDetails(req.body, '', (done) => {
							//		res.redirect('/cataloglist/1');
							//	})

						} else {
							sess = req.session;
							sess.error = 'Catalog Image Not Uploaded!';
							res.redirect('/addcatalog');
						}
					}
				})

			} else {
				res.redirect('/');
			}
		})


		/*
			  router.post('/addcatalog', (req,res)=>{
			  	sess = req.session;
			  	sess.active = 'addcatalog';
					if(typeof sess.user != 'undefined') {
						db.collection('catalogs').find({name: req.body.name}).toArray((err, results)=>{
							if(results.length){
								if(typeof req.body.catalogId != 'undefined' && req.body.catalogId != ''){
		 							webHandler.updateCatalogDetails(req.body, (done)=>{
											res.redirect('/cataloglist/1');		
									})
		 						}else{
		 							sess = req.session;
						 			sess.error = 'Data Not Saved Catalog Already Present into system!';
						 			res.redirect('/addcatalog');
		 						}
							}else{
								var catalogData = {
			 						catalogID: 'catalog#'+new MongoId().toString(),	
									vendorId: req.body.vendorId,
									name: req.body.name,
									price: typeof req.body.price != 'undefined' ? req.body.price: '',
									description: typeof req.body.description != 'undefined' ? req.body.description: 0,
									notes: typeof req.body.notes != 'undefined' ? req.body.notes: '',
									categoriesId: typeof req.body.categoriesId != 'undefined' ? parseInt(req.body.categoriesId) : '',
									created_at: new Date()
								};
								db.collection('catalogs').find({}).sort({'created_at': -1}).limit(1).toArray((err, results1)=>{
									catalogData.id = ('000'+(parseInt(results1[0].id)+1)).slice(-4);
									db.collection('catalogs').insertOne(catalogData, (err, results)=>{
										if (err) {
							  			sess = req.session;
								 			sess.error = 'Data Not Saved!';
								 			res.redirect('/addcatalog');
							  		}else{
							  			res.redirect('/cataloglist/1');
							  		}
									})
								})
							}
						})
					}else {
					  res.redirect('/');
					}
			  }) */



		router.post('/cataloglist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'cataloglist';
			var perPage = (typeof req.body.perpage != 'undefined') ? parseInt(req.body.perpage) : 10;
			sess.catalogPerPage = perPage;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;
			if (typeof req.body.by != 'undefined' && (req.body.by != '' || (req.body.todate != '' && req.body.fromdate != '') || (req.body.minprice != '' && req.body.maxprice != ''))) {
				if (typeof sess.user != 'undefined') {
					var data = {
						error: false
					};
					if (typeof sess.error != 'undefined') {
						data.error = true;
						data.msg = sess.error;
						delete sess.error;
					}
					c("search ::::::::::::::::::::::::::::::::::::: ", req.body);
					var wh = {};
					if (req.body.search != '') {
						if (req.body.by != '') {
							if (req.body.by == 'name') {
								wh['name'] = {
									$regex: req.body.search,
									$options: '$i'
								};
							} else if (req.body.by == 'price') {
								wh['price'] = parseInt(req.body.search);
							} else if (req.body.by == 'id') {
								if (req.body.search.toString().trim().length == 24) {
									wh['_id'] = new MongoId(req.body.search.toString().trim());
								} else {
									wh['_id'] = new MongoId('000000000000000000000000');
								}
							} else if (req.body.by == 'cat' && req.body.categoriesId != '') {
								wh['categoriesId'] = parseInt(req.body.categoriesId);
							}
						}
					} else {
						if (req.body.by != '') {
							if (req.body.by == 'cat' && req.body.categoriesId != '') {
								wh['categoriesId'] = parseInt(req.body.categoriesId);
							}
						}
					}
					if (req.body.todate != '' && req.body.fromdate != '') {
						wh['$and'] = [{
							created_at: {
								$gte: new Date(req.body.todate + ' 00:00:00')
							}
						}, {
							created_at: {
								$lte: new Date(req.body.fromdate + ' 23:59:59')
							}
						}]

						if (req.body.minprice != '' && req.body.maxprice != '') {
							wh['$and'].push({
								price: {
									$gte: parseInt(req.body.minprice)
								}
							}, {
								price: {
									$lte: parseInt(req.body.maxprice)
								}
							});
						}
					} else {
						if (req.body.minprice != '' && req.body.maxprice != '') {
							wh['$and'] = [{
								price: {
									$gte: parseInt(req.body.minprice)
								}
							}, {
								price: {
									$lte: parseInt(req.body.maxprice)
								}
							}];
						}
					}
					c("wh :::::::::::::: ", wh);
					db.collection('catalogs').find(wh).toArray((err, catalogresults) => {
						c("err ::::::::::::::::::::::::::: ", err)
						if (catalogresults.length) {
							var aggregated = [{
									$match: wh
								},
								{
									$lookup: {
										from: "categories",
										localField: "categoriesId",
										foreignField: "catId",
										as: "user_role"
									}
								},
								{
									$unwind: "$user_role"
								},
								{
									$project: {
										_id: 1,
										catalogId: "$catalogID",
										name: "$name",
										description: "$description",
										created_at: "$created_at",
										_ia: "$_ia",
										vendorId: "$vendorId",
										price: "$price",
										notes: "$notes",
										categoryName: "$user_role.name",
										categoriesId: "$user_role.catId",
										count: {
											$sum: 1
										},
										catalog_image: "$catalog_image"
									}
								},
								{
									$sort: {
										created_at: -1
									}
								},
								{
									$skip: parseInt(skip)
								},
								{
									$limit: parseInt(perPage)
								}
							];
							db.collection('catalogs').aggregate(aggregated).toArray((err, results) => {
								if (!err) {
									for (var i = 0; i < results.length; i++) {
										results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
									}
									data['data'] = results;
									data['search'] = req.body;
									data['current'] = page;
									data['pages'] = Math.ceil(catalogresults.length / perPage);
								} else {
									data['data'] = [];
									data['search'] = req.body;
									data['current'] = page;
									data['pages'] = 0;
								}
								// c("data ::::::::::: cataloglist list ",data);
								// webHandler.responseData('cataloglist.html', data, res);
								temp(data['data'], 0, (cb) => {
									data['data'] = cb;
									c("data ::::::::::: cataloglist list ", data);
									webHandler.responseData('cataloglist.html', data, res);
								})

								function temp(data, i, done) {
									if (data.length) {
										data[i].vendorId = typeof data[i].vendorId != 'undefined' ? data[i].vendorId.length == 24 ? data[i].vendorId : '000000000000000000000000' : '000000000000000000000000';
										db.collection('vendor').find({
											_id: new MongoId(data[i].vendorId)
										}).toArray((err, results) => {
											if (results.length) {
												data[i].vendorName = results[0].name;
											} else {
												data[i].vendorName = '-';
											}
											//				db.collection('products').find({catalogId: data[i].catalogId}).toArray((err, results)=>{
											//					if(results.length){
											//						data[i].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/'+results[0].product_image;
											//					}else{
											//						data[i].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/img/snfl.png';
											//					}
											db.collection('sharecatalog').count({
												catalogId: data[i].catalogId
											}, (err, shareCount) => {
												data[i].share = shareCount;
												if (typeof data[++i] != 'undefined') {
													temp(data, i, done);
												} else {
													return done(data);
												}
											})
											//				})
										})
									} else {
										return done(data);
									}
								}
							})
						} else {
							data['data'] = [];
							data['search'] = req.body;
							data['current'] = page;
							data['pages'] = 0;
							webHandler.responseData('cataloglist.html', data, res);
						}
					})
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/cataloglist/' + req.params.page);
			}
		})
		router.get('/cataloglist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'cataloglist';
			var perPage = (typeof sess.catalogPerPage != 'undefined') ? parseInt(sess.catalogPerPage) : 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * page) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;
			c("limit L::::::::::: ", limit);
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}

				db.collection('catalogs').find({}).sort({
					created_at: -1
				}).toArray((err, catalogresults) => {
					if (catalogresults.length) {
						var aggregated = [{
								$lookup: {
									from: "categories",
									localField: "categoriesId",
									foreignField: "catId",
									as: "user_role"
								}
							},
							{
								$unwind: "$user_role"
							},
							{
								$project: {
									_id: 1,
									catalogId: "$catalogID",
									name: "$name",
									description: "$description",
									created_at: "$created_at",
									_ia: "$_ia",
									price: "$price",
									notes: "$notes",
									categoryName: "$user_role.name",
									categoriesId: "$user_role.catId",
									count: {
										$sum: 1
									},
									catalog_image: "$catalog_image"
								}
							},
							{
								$sort: {
									created_at: -1
								}
							},
							{
								$skip: parseInt(skip)
							},
							{
								$limit: parseInt(perPage)
							}

						];
						db.collection('catalogs').aggregate(aggregated).toArray((err, results) => {
							if (!err) {
								for (var i = 0; i < results.length; i++) {
									results[i].created_at = _date(results[i].created_at).format('DD MMMM, YYYY HH:mm:ss');
								}
								data['data'] = results;
								data['search'] = {
									perpage: perPage
								};
								data['current'] = page;
								data['pages'] = Math.ceil(catalogresults.length / perPage);
							} else {
								c("err ::::::::::::::::::: ", err);
								data['data'] = [];
								data['search'] = {
									perpage: perPage
								};
								data['current'] = page;
								data['pages'] = 0;
							}
							temp(data['data'], 0, (cb) => {
								data['data'] = cb;
								c("data ::::::::::: cataloglist list ", data);
								webHandler.responseData('cataloglist.html', data, res);
							})

							function temp(data, i, done) {
								if (data.length) {
									data[i].vendorId = typeof data[i].vendorId != 'undefined' ? data[i].vendorId.length == 24 ? data[i].vendorId : '000000000000000000000000' : '000000000000000000000000';
									db.collection('vendor').find({
										_id: new MongoId(data[i].vendorId)
									}).toArray((err, results) => {
										if (results.length) {
											data[i].vendorName = results[0].name;
										} else {
											data[i].vendorName = 'Sun Fashion and Lifestyle';
										}
										//					db.collection('products').find({catalogId: data[i].catalogId}).toArray((err, results)=>{
										//						if(results.length){
										//							data[i].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/'+results[0].product_image;
										//						}else{
										//							data[i].image = 'http://ec2-52-14-140-220.us-east-2.compute.amazonaws.com:3000/img/snfl.png';
										//						}
										db.collection('sharecatalog').count({
											catalogId: data[i].catalogId
										}, (err, shareCount) => {
											data[i].share = shareCount;
											if (typeof data[++i] != 'undefined') {
												temp(data, i, done);
											} else {
												return done(data);
											}
										})
										//					})
									})
								} else {
									return done(data);
								}
							}
						})
					} else {

					}
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/deleteCatalog/:id', (req, res) => {
			sess = req.session;
			sess.active = 'cataloglist';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('catalogs').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 500
						});
					} else {
						return res.send({
							error: true,
							status: 200
						});
					}
				})
			} else {
				res.redirect('/cataloglist/1');
			}
		})
		router.get('/deleteCategories/:id', (req, res) => {
			sess = req.session;
			sess.active = 'deleteCategories';
			if (typeof sess.user != 'undefined' && typeof req.params.id != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('categories').remove({
					_id: new MongoId(req.params.id)
				}, (err, results) => {
					if (!err) {
						return res.send({
							error: true,
							status: 500
						});
					} else {
						return res.send({
							error: true,
							status: 200
						});
					}
				})
			} else {
				res.redirect('/');
			}
		})
		router.get('/addcatagories', (req, res) => {
			sess = req.session;
			sess.active = 'addcatagories';
			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				console.log('req.query.id ::::::::::: ', req.query.id);
				if (typeof req.query.id != 'undefined') {
					db.collection('categories').find({
						_id: new MongoId(req.query.id)
					}).toArray((err, results) => {
						c("err get addcatagories:::::::::: ", err);
						c("results get addcatagories:::::::::: ", results);
						if (results.length) {
							data.data = results[0];
							console.log("data ::::: ", data);
							webHandler.responseData('addcatagories.html', data, res);
						}
					})
				} else {
					data.data = {};
					webHandler.responseData('addcatagories.html', data, res);
				}
			} else {
				res.redirect('/');
			}
		})
		router.get('/catagorieslist/:page', (req, res) => {
			sess = req.session;
			sess.active = 'catagorieslist';
			var perPage = 10;
			var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
			var skip = (perPage * parseInt(page)) - perPage;
			var limit = "LIMIT " + skip + ", " + perPage;

			if (typeof sess.user != 'undefined') {
				var data = {
					error: false
				};
				if (typeof sess.error != 'undefined') {
					data.error = true;
					data.msg = sess.error;
					delete sess.error;
				}
				db.collection('categories').find({}).skip(skip).limit(perPage).toArray((err, results) => {
					if (!err) {
						data['data'] = results;
						data['current'] = page;
						data['pages'] = Math.ceil(results.length / perPage);
					}
					c("data ::::::::::: categories list ", data);
					webHandler.responseData('catagorieslist.html', data, res);
				})
			} else {
				res.redirect('/');
			}
		})
		router.post('/addcatagories', (req, res) => {
			files.categoriesUpload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					return res.send({
						error: 'Y',
						msg: 'Upliad file error'
					});
				} else if (err) {
					// An unknown error occurred when uploading.
					return res.send({
						error: 'Y',
						msg: 'Upliad file error'
					});
				}
				if (typeof req.file != 'undefined' && typeof req.file.filename != 'undefined') {
					db.collection('categories').find({}).sort({
						catId: -1
					}).toArray((err, preresults) => {
						db.collection('categories').find({
							name: req.body.name
						}).toArray((err, results) => {
							if (results.length) {
								if (typeof req.body.categoriesId != 'undefined' && req.body.categoriesId != '') {

									webHandler.updateCategoryDetails(req.body, req.file.filename, (done) => {
										res.send({
											error: 'N',
											'msg': 'category successfully added!'
										});
									})

								} else {
									res.send({
										error: 'Y',
										'msg': 'Data Not Saved Category Already Present into system!'
									});
								}
							} else {
								var categoriesData = {
									name: req.body.name,
									catId: parseInt(preresults[0].catId) + 1,
									categories_image: BaseUrl + '/public/categories/' + req.file.filename
								};
								db.collection('categories').insertOne(categoriesData, (err, results) => {
									if (err) {
										res.send({
											error: 'Y',
											'msg': 'Database Error!'
										});
									} else {
										res.send({
											error: 'N',
											'msg': 'category successfully added!'
										});
									}
								})
							}
						})
					})
				} else {
					if (typeof req.body.categoriesId != 'undefined' && req.body.categoriesId != '') {

						webHandler.updateCategoryDetails(req.body, '', (done) => {
							res.send({
								error: 'N',
								'msg': 'category successfully added!'
							});
						})

					} else {
						res.send({
							error: 'Y',
							'msg': 'Category Image Not Uploaded!'
						});
					}
				}

			})
		})
		router.get('/api/categories', (req, res) => {
			db.collection('categories').find().toArray((err, results) => {
				if (results.length) {
					for (var i = 0; i < results.length; i++) {
						delete results[i]._id;
						results[i].id = results[i].catId;
						delete results[i].catId;
					}
					return res.send(results);
				} else {
					return res.send({
						error: 'Y',
						msg: 'no categories found!',
						data: []
					});
				}
			})
		});
		router.get('/api/vendors', (req, res) => {
			db.collection('vendor').find().toArray((err, results) => {
				if (results.length) {
					return res.send(results);
				} else {
					return res.send({
						error: 'Y',
						msg: 'no vendors found!',
						data: []
					});
				}
			})
		});
		router.get('/api/catalogs', (req, res) => {
			db.collection('catalogs').find().toArray((err, results) => {
				if (results.length) {
					return res.send(results);
				} else {
					return res.send({
						error: 'Y',
						msg: 'no catalogs found!',
						data: []
					});
				}
			})
		});
		router.get('/api/resellers', (req, res) => {
			db.collection('reseller').find().toArray((err, results) => {
				if (results.length) {
					return res.send(results);
				} else {
					return res.send({
						error: 'Y',
						msg: 'no resellers found!',
						data: []
					});
				}
			})
		});
		router.post('/api/PrePaid', (req, res) => {
			var lastWeek = new Date();
			lastWeek.setDate(lastWeek.getDate() - 7);
			lastWeek = new Date(lastWeek);
			console.log("last date ::::::: ", lastWeek, new Date());

			var query = [];
			if (typeof req.body.startdate != 'undefined' && typeof req.body.enddate != 'undefined' && req.body.startdate != '' && req.body.enddate != '') {
				firstDay = new Date(req.body.startdate);
				lastWeek = new Date(req.body.enddate);
				query = [{
						$match: {
							status: 1,
							$or: [{
								'paymentMethod': '1'
							}, {
								'paymentMethod': '0'
							}],
							$and: [{
								created_at: {
									$gte: firstDay
								}
							}, {
								created_at: {
									$lte: lastWeek
								}
							}]
						}
					},
					{
						$group: {
							_id: '$date',
							totalAmount: {
								$sum: 1
							}
						}
					}
				];

				var earning = [];

				firstDay = _date(req.body.startdate).format('YYYY-MM-DD');
				lastWeek = _date(req.body.enddate).format('YYYY-MM-DD');

				var arr = common.getDateArray(firstDay, lastWeek);

				console.log("arr :::::::: ", arr);

				for (var i = 0; i < arr.length; i++) {
					earning.push({
						"elapsed": arr[i],
						"Earning": 0
					});
				}

			} else {
				query = [{
						$match: {
							status: 1,
							$or: [{
								'paymentMethod': '1'
							}, {
								'paymentMethod': '0'
							}],
							$and: [{
								created_at: {
									$gte: lastWeek
								}
							}, {
								created_at: {
									$lte: new Date()
								}
							}]
						}
					},
					{
						$group: {
							_id: '$date',
							totalAmount: {
								$sum: 1
							}
						}
					}
				];

				var earning = [];

				firstDay = _date().format('YYYY-MM-DD');
				lastWeek = _date(lastWeek).format('YYYY-MM-DD');
				var arr = common.getDateArray(lastWeek.toString(), firstDay.toString());

				for (var i = 0; i < arr.length; i++) {
					earning.push({
						"elapsed": arr[i],
						"Earning": 0
					});
				}

			}
			db.collection('orderplace').aggregate(query).toArray((err, aggregateOrders) => {

				console.log("aggregateOrders ::::: ", aggregateOrders);

				if (aggregateOrders.length) {
					for (var i = 0; i < aggregateOrders.length; i++) {
						var d = _date(aggregateOrders[i]._id).format('DD-MM-YY');
						for (var j = 0; j < arr.length; j++) {
							if (arr[j].toString() == d.toString()) {
								earning[j]['Earning'] += aggregateOrders[i]['totalAmount'];
							}
						}
					}
				}

				res.send(earning);
			})
		})
		router.post('/api/earning', (req, res) => {
			var lastWeek = new Date();
			lastWeek.setDate(lastWeek.getDate() - 7);
			lastWeek = new Date(lastWeek);
			console.log("last date ::::::: ", lastWeek, new Date());

			var query = [];
			if (typeof req.body.startdate != 'undefined' && typeof req.body.enddate != 'undefined' && req.body.startdate != '' && req.body.enddate != '') {
				firstDay = new Date(req.body.startdate);
				lastWeek = new Date(req.body.enddate);
				query = [{
						$match: {
							transactionId: {
								$ne: ''
							},
							status: 1,
							$and: [{
								created_at: {
									$gte: firstDay
								}
							}, {
								created_at: {
									$lte: lastWeek
								}
							}]
						}
					},
					{
						$group: {
							_id: '$date',
							totalAmount: {
								$sum: "$finalCollect"
							}
						}
					}
				];

				var earning = [];

				firstDay = _date(req.body.startdate).format('YYYY-MM-DD');
				lastWeek = _date(req.body.enddate).format('YYYY-MM-DD');

				var arr = common.getDateArray(firstDay, lastWeek);

				console.log("arr :::::::: ", arr);

				for (var i = 0; i < arr.length; i++) {
					earning.push({
						"elapsed": arr[i],
						"Earning": 0
					});
				}

			} else {
				query = [{
						$match: {
							transactionId: {
								$ne: ''
							},
							status: 1,
							$and: [{
								created_at: {
									$gte: lastWeek
								}
							}, {
								created_at: {
									$lte: new Date()
								}
							}]
						}
					},
					{
						$group: {
							_id: '$date',
							totalAmount: {
								$sum: "$finalCollect"
							}
						}
					}
				];

				var earning = [];

				firstDay = _date().format('YYYY-MM-DD');
				lastWeek = _date(lastWeek).format('YYYY-MM-DD');
				var arr = common.getDateArray(lastWeek.toString(), firstDay.toString());

				for (var i = 0; i < arr.length; i++) {
					earning.push({
						"elapsed": arr[i],
						"Earning": 0
					});
				}

			}
			db.collection('orderplace').aggregate(query).toArray((err, aggregateOrders) => {

				console.log("aggregateOrders ::::: ", aggregateOrders);

				if (aggregateOrders.length) {
					for (var i = 0; i < aggregateOrders.length; i++) {
						var d = _date(aggregateOrders[i]._id).format('DD-MM-YY');
						for (var j = 0; j < arr.length; j++) {
							if (arr[j].toString() == d.toString()) {
								earning[j]['Earning'] += aggregateOrders[i]['totalAmount'];
							}
						}
					}
				}
				res.send(earning);
			})
		})
		router.post('/api/catalog_product_list', (req, res) => {
			if (typeof req.query.start == 'undefined' || typeof req.query.end == 'undefined' || typeof req.body.catalogId == 'undefined') {
				return res.send({
					error: 'Y',
					msg: 'parameter invalid',
					data: req.query
				});
			}
			db.collection('catalogs').find({
				catalogID: req.body.catalogId
			}).toArray((err, catalogResults) => {
				if (!err) {
					if (catalogResults.length) {
						db.collection('products').find({
							catalogId: req.body.catalogId
						}).skip(parseInt(req.query.start)).limit(parseInt(req.query.end)).toArray((err, results) => {
							db.collection('products').count({
								catalogId: req.body.catalogId
							}, (err, productCounts) => {
								if (results.length) {
									var temper = [];
									for (var i = 0; i < results.length; i++) {
										temper.push({});
										temper[i]['id'] = results[i]._id;
										temper[i]['name'] = results[i].name;
										temper[i]['productId'] = results[i].productId;
										temper[i]['productName'] = results[i].name;
										temper[i]['discountPrice'] = results[i].discount_price;
										temper[i]['qty'] = results[i].qty;
										temper[i]['productPrice'] = results[i].price;
										temper[i]['discountPercentage'] = 0;
										temper[i]['size'] = results[i].size;
										temper[i]['weight'] = results[i].weight;
										temper[i]['productDescription'] = results[i].description;

										temper[i]['productSize'] = results[i]['size'].toString().split(', ');
										temper[i]['productOldPrice'] = 0;
										temper[i]['productImage'] = [];

										if (typeof results[i]['product_image'] != 'undefined' && results[i]['product_image'] != '') {
											temper[i]['productImage'].push(results[i]['product_image']);
										}
										if (typeof results[i]['product_image1'] != 'undefined' && results[i]['product_image1'] != '') {
											temper[i]['productImage'].push(results[i]['product_image1']);
										}
										if (typeof results[i]['product_image2'] != 'undefined' && results[i]['product_image2'] != '') {
											temper[i]['productImage'].push(results[i]['product_image2']);
										}
										if (typeof results[i]['product_image3'] != 'undefined' && results[i]['product_image3'] != '') {
											temper[i]['productImage'].push(results[i]['product_image3']);
										}

										temper[i]['productSize'] = results[i]['size'].toString().split(',');
										temper[i]['ProductRating'] = [];
										temper[i]['avgProductRating'] = 0;
									}

									function temp(temper, i, tempDone) {
										db.collection('review').find({
											productId: results[i].productId
										}).limit(2).toArray((err, results) => {
											temper[i].ProductRating = [];
											if (!err) {
												temper[i].ProductRating = results;
											}
											if (typeof temper[++i] != 'undefined') {
												temp(temper, i, tempDone);
											} else {
												return tempDone(temper);
											}
										})
									}
									temp(temper, 0, (temper) => {
										res.send({
											error: 'N',
											'data': temper,
											msg: '',
											'catalogDescription': catalogResults[0]['description'],
											'totalCount': temper.length,
											'totalProductCount': productCounts
										});
									})
								} else {
									return res.send({
										error: 'N',
										msg: 'products not available',
										data: []
									});
								}
							})
						})
					} else {
						return res.send({
							error: 'N',
							msg: 'catalogs not available',
							data: []
						});
					}
				} else {
					return res.send({
						error: 'Y',
						msg: 'database error!',
						data: []
					});
				}
			})
		});
	},

	getTotalCounts: (cb) => {
		var totalCounts = {
			totalOrders: 0,
			pendingOrders: 0,
			approvedOrders: 0,
			totalReseller: 0,
			totalCategories: 0,
			totalCatalogs: 0,
			totalStock: 0,
			OutOfStock: 0,
			TopSell: 0,
			totalCart: 0
		};
		db.collection('orderplace').count({}, (err, totalOrders) => {
			db.collection('orderplace').count({
				$or: [{
					status: 0
				}, {
					status: '0'
				}]
			}, (err, pendingOrders) => {
				db.collection('orderplace').count({
					$or: [{
						status: 1
					}, {
						status: '1'
					}]
				}, (err, approvedOrders) => {
					db.collection('reseller').aggregate([{
						$group: {
							_id: 1,
							total: {
								$sum: '$payable_margin'
							}
						}
					}]).toArray((err, totalPayable) => {
						db.collection('reseller').aggregate([{
							$group: {
								_id: 1,
								total: {
									$sum: '$paid_margin'
								}
							}
						}]).toArray((err, totalPaid) => {
							db.collection('reseller').count({}, (err, totalReseller) => {
								db.collection('vendor').count({}, (err, totalVendor) => {
									db.collection('categories').count({}, (err, totalCategories) => {
										db.collection('catalogs').count({}, (err, totalCatalogs) => {
											db.collection('cart').count({}, (err, totalCart) => {
												db.collection('products').count({
													qty: 0
												}, (err, OutOfStock) => {
													db.collection('products').count({
														qty: {
															$ne: 0
														}
													}, (err, totalStock) => {
														db.collection('products').count({
															$and: [{
																qty: {
																	$lte: 5
																}
															}, {
																qty: {
																	$gt: 0
																}
															}]
														}, (err, lowStock) => {
															db.collection('orderplace').count({
																$or: [{
																	status: 2
																}, {
																	status: '2'
																}]
															}, (err, cancelOrders) => {
																db.collection('orderproducts').aggregate([{
																	$group: {
																		_id: '$productId',
																		totalCount: {
																			$sum: 1
																		},
																		name: {
																			$last: '$ProductName'
																		}
																	}
																}, {
																	$sort: {
																		totalCount: -1
																	}
																}]).toArray((err, topSell) => {

																	var pipeline = [{
																		$group: {
																			_id: '$catalogId',
																			totalCount: {
																				$sum: 1
																			}
																		}
																	}, {
																		$sort: {
																			totalCount: -1
																		}
																	}];

																	db.collection('sharecatalog').aggregate(pipeline).toArray((err, mostShare) => {
																		var pipeline = [{
																			$lookup: {
																				from: "vendor",
																				localField: "vendorId",
																				foreignField: "_id",
																				as: "user_role"
																			}
																		}, {
																			$group: {
																				_id: '$_id',
																				totalCount: {
																					$sum: 1
																				},
																				totalSell: {
																					$sum: '$totalAmount'
																				},
																				vendorDetails: {
																					$last: "$user_role"
																				}
																			}
																		}, {
																			$sort: {
																				totalSell: -1
																			}
																		}, {
																			$limit: 1
																		}];

																		db.collection('orderplace').aggregate(pipeline).toArray((err, topSell) => {

																			totalCounts.topSeller = topSell.length ? topSell[0].vendorDetails.length ? topSell[0].vendorDetails[0].name : '' : '';
																			totalCounts.totalOrders = totalOrders;
																			totalCounts.pendingOrders = pendingOrders;
																			totalCounts.approvedOrders = approvedOrders;
																			totalCounts.totalReseller = totalReseller;
																			totalCounts.totalVendor = totalVendor;
																			totalCounts.totalCategories = totalCategories;
																			totalCounts.totalCatalogs = totalCatalogs;
																			totalCounts.totalCart = totalCart;
																			totalCounts.OutOfStock = OutOfStock;
																			totalCounts.totalStock = totalStock;
																			totalCounts.lowStock = lowStock;
																			totalCounts.cancelOrders = cancelOrders;
																			totalCounts.totalMargin = typeof totalPayable.length != 'undefined' ? totalPayable[0].total : 0;
																			totalCounts.leftMargin = typeof totalPayable.length != 'undefined' && typeof totalPaid.length != 'undefined' ? parseInt(totalPayable[0].total) - parseInt(totalPaid[0].total) : 0;
																			totalCounts.paidMargin = typeof totalPaid.length != 'undefined' ? totalPaid[0].total : 0;
																			totalCounts.topSelling = {
																				count: typeof topSell.length != 'undefined' ? topSell[0].totalCount : 0,
																				name: typeof topSell.length != 'undefined' ? topSell[0].name : ''
																			};
																			totalCounts.mostShare = mostShare;

																			return cb(totalCounts);
																		})
																	})
																})
															})
														})
													})
												})
											})
										})
									})
								})
							})
						})
					})
				})
			})
		})
	},
	updateVendorDetails: (data, file, done) => {
		if (file != '') {
			var vendorData = {
				profile: file
			};
		} else {
			var vendorData = {};
		}

		if (typeof data.name != 'undefined') {
			vendorData.name = data.name;
		}
		if (typeof data.contactno != 'undefined') {
			vendorData.contactno = data.contactno;
		}
		if (typeof data.GST_number != 'undefined') {
			vendorData.GST_number = data.GST_number;
		}
		if (typeof data.accountno != 'undefined') {
			vendorData.accountno = data.accountno;
		}
		if (typeof data.accountname != 'undefined') {
			vendorData.accountname = data.accountname;
		}
		if (typeof data.bankname != 'undefined') {
			vendorData.bankname = data.bankname;
		}
		if (typeof data.ifsc != 'undefined') {
			vendorData.ifsc = data.ifsc;
		}
		if (typeof data.address != 'undefined') {
			vendorData.address = data.address;
		}
		if (typeof data.email != 'undefined') {
			vendorData.email = data.email;
		}
		if (typeof data.password != 'undefined') {
			vendorData.password = data.password;
		}
		c("vendorData :::::::::::::: ", vendorData, data);
		if (!_.isEmpty(vendorData)) {
			db.collection('vendor').update({
				_id: new MongoId(data.vendorId)
			}, {
				$set: vendorData
			}, (err, results) => {
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateBannerDetails: (data, file, done) => {
		if (file != '') {
			var bannerData = {
				banner_image: BaseUrl + '/public/banner/' + file
			};
		} else {
			var bannerData = {};
		}

		if (typeof data.name != 'undefined') {
			bannerData.name = data.name;
		}
		if (!_.isEmpty(bannerData)) {
			db.collection('banner').update({
				_id: new MongoId(data.bannerId)
			}, {
				$set: bannerData
			}, (err, results) => {
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateProductDetails: (data, file, done) => {
		c("file ::::: ", file);
		if (file != '') {
			var productData = {};
			if (typeof file[0] != 'undefined') {
				productData.product_image = 'public/products/' + file[0].filename;
			}
			if (typeof file[1] != 'undefined') {
				productData.product_image1 = 'public/products/' + file[1].filename;
			}
			if (typeof file[2] != 'undefined') {
				productData.product_image2 = 'public/products/' + file[2].filename;
			}
			if (typeof file[3] != 'undefined') {
				productData.product_image3 = 'public/products/' + file[3].filename;
			}
		} else {
			var productData = {};
		}

		if (typeof data.name != 'undefined') {
			productData.name = data.name;
		}
		if (typeof data.price != 'undefined') {
			productData.price = parseInt(data.price);
		}
		if (typeof data.discount_pre != 'undefined') {
			productData.discount_pre = parseInt(data.discount_pre);
		}
		if (typeof data.discount_price != 'undefined') {
			productData.discount_price = parseInt(data.discount_price);
		}
		if (typeof data.weight != 'undefined') {
			productData.weight = parseInt(data.weight);
		}
		if (typeof data.qty != 'undefined') {
			productData.qty = parseInt(data.qty);
		}
		if (typeof data.size != 'undefined') {
			productData.size = data.size;
		}
		if (typeof data.description != 'undefined') {
			productData.description = data.description;
		}
		if (typeof data.notes != 'undefined') {
			productData.notes = data.notes;
		}
		if (!_.isEmpty(productData)) {
			db.collection('products').update({
				_id: new MongoId(data.productId)
			}, {
				$set: productData
			}, (err, results) => {
				if (!err) {} else {
					c("error ::::::::::::::::::::::: ", err);
				}
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateBankDetails: (data, done) => {
		console.log("updateBankDetails ::::: data :::::: =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", data);
		var bankDetails = {};
		if (typeof data.account_holder_name != 'undefined') {
			bankDetails.accountname = data.account_holder_name;
		}
		if (typeof data.account_number != 'undefined') {
			bankDetails.accountno = data.account_number;
		}
		if (typeof data.bankname != 'undefined') {
			bankDetails.bankname = data.bankname;
		}
		if (typeof data.IFSC_code != 'undefined') {
			bankDetails.ifsc = data.IFSC_code;
		}
		console.log("bankDetails ::::::::::: ", bankDetails);
		if (!_.isEmpty(bankDetails)) {
			console.log("not emplty :::: ");
			db.collection('bankdetails').update({
				resellerId: data.resellerId
			}, {
				$set: bankDetails
			}, (err, results) => {
				console.log("updateBankDetails ::::: error :::::::: ", err);
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateResellerDetails: (data, file, done) => {
		if (file != '') {
			var resellerData = {
				profile: BaseUrl + '/public/reseller/' + file
			};
		} else {
			var resellerData = {};
		}

		if (typeof data.name != 'undefined') {
			resellerData.name = data.name;
		}
		if (typeof data.mobile1 != 'undefined') {
			resellerData.mobile1 = data.mobile1;
		}
		if (typeof data.mobile2 != 'undefined') {
			resellerData.mobile2 = data.mobile2;
		}
		if (typeof data.address != 'undefined') {
			resellerData.address = data.address;
		}
		resellerData.updated_at = new Date();
		if (!_.isEmpty(resellerData)) {
			db.collection('reseller').update({
				_id: new MongoId(data.resellerId)
			}, {
				$set: resellerData
			}, (err, results) => {
				console.log("resellerData ::::: error :::::::: ", err);
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateCatalogDetails: (data, file, done) => {
		var catalogData = {};
		if (file != '') {
			catalogData = {
				catalog_image: 'public/catalogs/' + file
			};
		}
		if (typeof data.name != 'undefined') {
			catalogData.name = data.name;
		}
		if (typeof data.price != 'undefined') {
			catalogData.price = data.price;
		}
		if (typeof data.description != 'undefined') {
			catalogData.description = data.description;
		}
		if (typeof data.vendorId != 'undefined') {
			catalogData.vendorId = data.vendorId;
		}
		if (typeof data.notes != 'undefined') {
			catalogData.notes = data.notes;
		}
		console.log("catalogData :::::::::::::::::::::::::::::: ", catalogData);
		if (!_.isEmpty(catalogData)) {
			db.collection('catalogs').update({
				_id: new MongoId(data.catalogId)
			}, {
				$set: catalogData
			}, (err, results) => {
				console.log("resellerData ::::: error :::::::: ", err);
				return done(true);
			})
		} else {
			return done(true);
		}
	},
	updateCategoryDetails: (data, file, done) => {
		if (file != '') {
			var categoryData = {
				categories_image: BaseUrl + '/public/categories/' + file
			};
		} else {
			var categoryData = {};
		}
		console.log("categoryData :::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ", categoryData);
		if (typeof data.name != 'undefined') {
			categoryData.name = data.name;
		}
		if (!_.isEmpty(categoryData)) {
			db.collection('categories').update({
				_id: new MongoId(data.categoriesId)
			}, {
				$set: categoryData
			}, (err, results) => {
				console.log("categoryData ::::: error :::::::: ", err);
				return done(true);
			})
		} else {
			return done(true);
		}
	}
}
