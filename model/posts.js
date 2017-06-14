//posts
var AWS = require('aws-sdk'),
	env = require('dotenv').config(),
	helper = {
		dateString: function(timestamp){
			var d = new Date(),
				offset = d.getTimezoneOffset(),
				postDate = new Date(timestamp+(offset)*60),
				year = postDate.getFullYear(),
				month = postDate.getMonth(),
				day = postDate.getDay(),
				date = postDate.getDate(),
				h = postDate.getHours(),
				m = postDate.getMinutes()+'';

			if(m.length === 1){
				m = '0'+m;
			}

			return helper.dayOfWeek(day)+' '+helper.monthName(month)+' '+date+' '+year+' '+h+':'+m;
		},
		dayOfWeek: function(day){
			var days = ['Sun','Mon','Tue','Wed','Thu','Fr','Sat'];

			return days[day];
		},
		monthName: function(month){
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

			return months[month];
		},
		previewText: function(body,limit){
			var startIndex = body.indexOf('<p>'),
				endIndex = body.indexOf('</p>'),
				paragraphText = body.substring(startIndex+3,endIndex);

			if(limit){
				if(paragraphText.length < limit){
					return paragraphText;
				} else {
					var lastFullWord = paragraphText.substring(0,limit).lastIndexOf(' ');

					return paragraphText.substring(0,lastFullWord)+' ...';
				}
			} else {
				return paragraphText;
			}
		},
		sortByMostRecent: function(data){
			var posts = data;

			posts.Items.sort(function(a, b) {
				var createdA = a.createdTime,
					createdB = b.createdTime;

				if (createdA < createdB) {
					return 1;
				}

				if (createdA > createdB) {
					return -1;
				}

				return 0;
			});

			return posts;
		},
		preparePosts: function(post){
			post = helper.sortByMostRecent(post);

			for(var i in post.Items){
				//if created and last modified times are identical..remove the last modified date
				if(post.Items[i].createdTime === post.Items[i].lastModifiedTime){
					delete post.Items[i].lastModifiedTime;
				} else {
					post.Items[i].lastModifiedTime = helper.dateString(post.Items[i].lastModifiedTime);
				}

				post.Items[i].createdTime = helper.dateString(post.Items[i].createdTime);

				post.Items[i].previewText = helper.previewText(post.Items[i].body,140);
			}

			return post;
		}
	};

AWS.config.accessKeyId = process.env.ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.SECRET_ACCESS_KEY;

var getTable = function(tableName,callback){
	var db = new AWS.DynamoDB({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	var params = {
		ExclusiveStartTableName: tableName,
		Limit: 100
	};

	db.listTables({},function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(data);
			} else {
				return data;
			}
		}
	});
};

var find = function(tableName,queryObj,callback){
	var attr,val;

	for(var key in queryObj){
		attr = key;
		val = queryObj[key];
	}

	var db = new AWS.DynamoDB.DocumentClient({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	// console.log('ExpressionAttributeNames: '+attr);
	// console.log('ExpressionAttributeValues: '+val);

	var params = {
		TableName: tableName,
		Select: 'ALL_ATTRIBUTES',
		FilterExpression: '#attr = :val',
		ExpressionAttributeNames:{
			'#attr': attr
		},
		ExpressionAttributeValues: {
			':val': val
		}
	};

	db.scan(params,function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(helper.preparePosts(data));
			} else {
				return data;
			}
		}
	});
};

var query = function(tableName,queryObj,callback){
	//@queryObj object {attr:val}
	var attr,val;

	for(var key in queryObj){
		attr = key;
		val = queryObj[key];
	}

	var db = new AWS.DynamoDB.DocumentClient({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	console.log('ExpressionAttributeNames: '+attr);
	console.log('ExpressionAttributeValues: '+val);

	var params = {
		TableName: tableName,
		Select: 'ALL_ATTRIBUTES',
		KeyConditionExpression: '#attr = :val',
		ExpressionAttributeNames:{
			'#attr': attr
		},
		ExpressionAttributeValues: {
			':val': val
		}
	};

	db.query(params,function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(data);
			} else {
				return data;
			}
		}
	});
};

var findTags = function(tableName,queryObj,callback){
	//@queryObj object {attr:val}
	var attr,val;

	for(var key in queryObj){
		attr = key;
		val = queryObj[key];
	}

	var db = new AWS.DynamoDB.DocumentClient({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	var params = {
		TableName: tableName,
		Select: 'ALL_ATTRIBUTES',
		ExpressionAttributeNames: { 
			'#published' : 'published' 
		},
		ExpressionAttributeValues: { 
			':val' : val,
			':published': true
		},
		FilterExpression: '(contains(tags, :val)) AND #published = :published'
	};

	db.scan(params,function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(helper.preparePosts(data));
			} else {
				return data;
			}
		}
	});
};

var scan = function(tableName,callback){
	var db = new AWS.DynamoDB.DocumentClient({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	var params = {
		TableName: tableName,
		Select: 'ALL_ATTRIBUTES',
		ExpressionAttributeNames: { 
			'#published' : 'published' 
		},
		ExpressionAttributeValues: { 
			':published': true
		},
		FilterExpression: '#published = :published'
	};

	db.scan(params,function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(helper.preparePosts(data));
			} else {
				return data;
			}
		}
	});
};

var getPost = function(tableName,postID,callback){
	var db = new AWS.DynamoDB({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});

	var params = {
		Key: {
			postID: {
				N: postID
			}
		},
		TableName: tableName
	};

	db.getItem(params,function(err,data){
		if(err){
			console.log(err);
		} else {
			if(callback && typeof callback === 'function'){
				callback(helper.preparePosts(data));
			} else {
				return data;
			}
		}
	});
};

var getPosts = function(order){
	var db = new AWS.DynamoDB({
		apiVersion: '2012-08-10',
		region: 'us-west-2'
	});
};

module.exports = {
	getTable: getTable,
	getPost: getPost,
	query: query,
	scan: scan,
	find: find,
	findTags: findTags
};