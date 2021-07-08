/*------------------------------CATEGORIES UPLOADS START ------------------------------------*/
var uploadPath = require('path').join(__dirname, '../views/public/categories');
var categoriesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.categoriesUpload = multer({
	storage: categoriesStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('categories_image');
/*------------------------------CATEGORIES UPLOADS END ------------------------------------*/


/*------------------------------RESELLER UPLOADS START ------------------------------------*/
var reselleruploadPath = require('path').join(__dirname, '../views/public/reseller');
var resellerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reselleruploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.resellerUpload = multer({
	storage: resellerStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('profile');
/*------------------------------RESELLER UPLOADS END ------------------------------------*/

/*------------------------------RESELLER UPLOADS START ------------------------------------*/
var marginuploadPath = require('path').join(__dirname, '../views/public/margin');
var marginStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, marginuploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.marginUpload = multer({
	storage: marginStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('marginImage');
/*------------------------------RESELLER UPLOADS END ------------------------------------*/

/*------------------------------VENDOR UPLOADS START ------------------------------------*/
var vendoruploadPath = require('path').join(__dirname, '../views/public/vendor');
var vendorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vendoruploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.vendorUpload = multer({
	storage: vendorStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('profile');
/*------------------------------VENDOR UPLOADS END ------------------------------------*/



/*------------------------------IMPS UPLOADS START ------------------------------------*/
var IMPSuploadPath = require('path').join(__dirname, '../views/public/imps');
var IMPSStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMPSuploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.impsUpload = multer({
	storage: IMPSStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('imps');
/*------------------------------IMPS UPLOADS END ------------------------------------*/


/*------------------------------BANK UPLOADS START ------------------------------------*/
var bankuploadPath = require('path').join(__dirname, '../views/public/bank');
var bankStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bankuploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.bankUpload = multer({
	storage: bankStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('image');
/*------------------------------IMPS UPLOADS END ------------------------------------*/

/*------------------------------BANNER UPLOADS START ------------------------------------*/
var banneruploadPath = require('path').join(__dirname, '../views/public/banner');
var bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, banneruploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.bannerUpload = multer({
  storage: bannerStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('image');
/*------------------------------IMPS UPLOADS END ------------------------------------*/

/*------------------------------PRODUCT UPLOADS START ------------------------------------*/
var productuploadPath = require('path').join(__dirname, '../views/public/products');
var productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productuploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.productUpload = multer({
	storage: productStorage,
    limits: {fileSize: 30*1024*1024, files: 4},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).array('productImage', 4);
/*------------------------------PRODUCT UPLOADS END ------------------------------------*/
/*------------------------------CATALOG UPLOADS START ------------------------------------*/
var cataloguploadPath = require('path').join(__dirname, '../views/public/catalogs');
var catalogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, cataloguploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.')[1])
  }
});
module.exports.catalogUpload = multer({
  storage: catalogStorage,
    limits: {fileSize: 30*1024*1024, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(JPEG|jpeg|JPG|jpg|PNG|png)$/))
          return callback(new Error('Only JPEG|jpeg|JPG|jpg|PNG|png are allowed !'), false);

        callback(null, true);
    }
}).single('catalog_img');
/*------------------------------CATALOG UPLOADS END ------------------------------------*/