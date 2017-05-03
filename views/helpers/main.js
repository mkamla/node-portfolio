var shortMonth = function(monthDigit){
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

	return months[parseInt(monthDigit,10)];
};

var longMonth = function(monthDigit){
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

	return months[parseInt(monthDigit,10)];
};

module.exports = {
	bodyContent: function(post){
		var index = post.body.indexOf('</h1>');

		var articleTime = function(){
			var modifiedTime = (post.hasOwnProperty('lastModifiedTime'))?'<time date-time="'+post.lastModifiedTime+'">'+post.lastModifiedTime+'</time>':'';

			return '<div class="meta"><time itemprop="age" datetime="'+post.createdTime+'">'+post.createdTime+'</time>'+modifiedTime+'</div>';
		};

		if(index !== -1){
			var heading = post.body.slice(0,index+5);
			return heading+articleTime()+post.body.slice(index+5);
		} else {
			return post;
		}
	},
	timeSince: function(dateString){
		var epoch = new Date(dateString).getTime(),
			now = new Date().getTime()+new Date().getTimezoneOffset(),
			diff = now-epoch,
			obj = {},
			string = '';

		if(diff > 0){
			obj.yrs = Math.floor(diff/31556952000);
			diff -= (obj.yrs*31556952000);

			obj.days = Math.floor(diff/86400000);
			diff -= (obj.days*86400000);

			obj.hrs = Math.floor(diff/3600000);
			diff -= (obj.hrs*3600000);

			obj.min = Math.floor(diff/60000);
			diff -= (obj.min*60000);

			obj.sec = Math.floor(diff/1000);
		}

		for(var i in obj){
			string += '<span class="'+i+'" data-'+i+'="'+obj[i]+'">'+obj[i]+' '+i+'</span> ';
		}

		return string;
	},
	activeNav: function(activePage, navLink){
		if(activePage === navLink){
			return 'class="active"';
		}
	},
	fullYear: function(dateString){
		return new Date(dateString).getFullYear();
	},
	monthAbv: function(dateString){
		var date = new Date(dateString);

		return shortMonth(date.getMonth());
	},
	monthFull: function(dateString){
		var date = new Date(dateString);

		return longMonth(date.getMonth());
	}
}