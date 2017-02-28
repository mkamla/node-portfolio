var AWS = require('aws-sdk'),
	env = require('dotenv').config();

AWS.config.accessKeyId = process.env.ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.SECRET_ACCESS_KEY;

var validate = function(data){
	var isValid = true,
		errors = [];

	var validateEmail = function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	};

	if(!data.name || data.name.length === 0){
		isValid = false;
		errors.push({
			code: '01',
			message: 'Submit your name.',
			fieldName: 'name'
		});
	}

	if(!validateEmail(data.email)){
		isValid = false;

		errors.push({
			code: '02',
			message: 'Email is invalid.',
			fieldName: 'email'
		});
	}

	if(!data.message || data.message.length < 1){
		isValid = false;

		errors.push({
			code: '03',
			message: 'Submit a message.',
			fieldName: 'message'
		});
	}

	if(isValid === false){
		return {
			'status': 'error',
			'errors': errors
		};
	} else {
		return {
			'status': 'ok',
			'data': data
		};
	}
};

var send = function(data,callback){
	var params = {
		Destination: {
			ToAddresses: [
				'micahkamla@gmail.com'
			]
		},
		Message: {
			Body: {
				Html: {
			 		Data: 'From: '+data.name+'<br />Message: '+data.message,
					Charset: 'UTF-8'
				},
			},
			Subject: {
				Data: 'Mkamla.com Message',
				Charset: 'UTF-8'
			}
		},
		Source: 'micahkamla@gmail.com',
		ReplyToAddresses: [
			data.email
		]
	};

	var ses = new AWS.SES({
		apiVersion: '2010-12-01',
		region: 'us-west-2'
	});

	ses.sendEmail(params,function(err,data){
		var rsp = {};

		if(err){
			console.log(err);
			rsp.status = 'error';
			rsp.errors = [{
				code: '04',
				message: 'Server error sending message.',
				fieldName: 'undefined'
			}];
		} else {
			rsp.status = 'ok';
		}

		if(callback && typeof callback === 'function'){
			callback(rsp);
		} else {
			console.log(rsp);
		}
	});
};

module.exports = {
	validate: validate,
	send: send
};