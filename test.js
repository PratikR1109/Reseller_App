
var watermark = require('image-watermark');
var options = {
    'text' : 'SF-000005', 
    'align' : 'ltr',
    'dstPath': __dirname+'/views/public/products/productImage-1555487266912.jpg',
    'color': 'rgb(0,0,0)'
};
watermark.embedWatermark(__dirname+'/views/public/products/3a92ca9c94cfea37564aa13f7bcc2e61.jpg', options);

//dsad
/*
var caption = require('caption');
var options = {
    'caption' : 'C245642019', 
    'align' : 'ltr',
    'outputFile': __dirname+'/views/public/products/testingwater.jpg'
};
// watermark.embedWatermark(__dirname+'/views/img/img12.jpg', options);

caption.path(__dirname+'/views/public/products/3a92ca9c94cfea37564aa13f7bcc2e61.jpg',options,function(err,captionedImage){
  console.log("err :::::: ", err);
  console.log("captionedImage :::::: ", captionedImage);
  // err will contain an Error object if there was an error
  // otherwise, captionedImage will be a path to a file.
})
*/
