module.exports = {
	InArray: function(needle, haystack) {
	    if(typeof haystack == 'undefined' || haystack == null || needle == null || typeof needle == 'undefined')
	    return false;
	    
	      var length = haystack.length;
	      for(var i = 0; i < length; i++){
	          if(haystack[i]!= null && typeof haystack[i] != 'undefined' && haystack[i].toString() == needle.toString())
	     		return true;
	      }
	      return false;
	},
	getDateArray: (start, end)=>{
		console.log("start :::::::: ", start);
		console.log("end :::::::: ", end);
    var arr = new Array();
    var dt = new Date(start);
    while (dt <= new Date(end)) {
        dt.setDate(dt.getDate() + 1);
        var datee = _date(dt).format('DD-MM-YY');
        arr.push(datee);
    }
    return arr;
}
}