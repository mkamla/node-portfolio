var https = require('https'),
	env = require('dotenv').config();

var wakatimeAPI = process.env.WAKATIME_SECRET_KEY,
	encodedAPI = new Buffer(wakatimeAPI).toString('base64');

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
		offset = date.getTimezoneOffset(),
		timestamp = date.getTime(),
		end = formatDate(timestamp + offset),
		start = formatDate((timestamp + offset)-86400000*6);

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