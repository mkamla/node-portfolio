var https = require('https'),
	env = require('dotenv').config();

var wakatimeAPI = process.env.WAKATIME_SECRET_KEY,
	encodedAPI = new Buffer(wakatimeAPI).toString('base64');

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

var formatDate = function(timestamp){
	var pad = function(digit){
		digit = digit+"";
		if(digit.length < 2){
			digit = '0'+digit;
		}

		return digit
	};
	
	var d = new Date(timestamp),
		year = parseInt(d.getFullYear(),10),
		month = pad(parseInt(d.getMonth(),10)+1),//zero based
		date = pad(parseInt(d.getDate(),10));

	return year+'-'+month+'-'+date;
};

var get = function(callback){
	var date = new Date(),
		cstOffset = (date.dst)?-300:-360,
		offset = date.getTimezoneOffset()+cstOffset,
		timestamp = date.getTime(),
		end = formatDate(timestamp - (offset*60000)),
		start = formatDate((timestamp - (offset*60000))-86400000*6);

	console.log('Start: '+start+', End: '+end);

	var requestOptions = {
		hostname: 'wakatime.com',
		path: '/api/v1/users/aca47a0f-4715-4c63-b7b2-0e1a52a8c3a2/summaries?start='+start+'&end='+end,
		method: 'GET',
		headers: {
			'Authorization': 'Basic ' + encodedAPI
		}
	};

	var request = https.request(requestOptions,function(rsp){
		var data = '';

		rsp.on('data',function(chunk){
			data += chunk;
		});

		rsp.on('end',function(){
			if(callback && typeof callback === 'function'){
				// console.log(JSON.parse(data));
				callback(JSON.parse(data));
			} else {
				return JSON.parse(data);
			}
		});
	});	

	request.on('error',function(error){
		if(callback && typeof callback === 'function'){
			console.log(error);
			callback(error);
		}
	});

	request.end();
};

module.exports = {
	get: get
};