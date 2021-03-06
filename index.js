var express = require('express'),
	https = require('https'),
	bodyParser = require('body-parser'),
	compression = require('compression'),
	app = express(),
	breadcrumbs = require('express-breadcrumbs'),
	helper = {
		convertCase: function(str) {
			var lower = str.toLowerCase();
			return lower.replace(/(^| )(\w)/g, function(x) {
				return x.toUpperCase();
			});
		}
	};

//view engine
var handlebars = require('express-handlebars').create({
	defaultLayout:'main',
	helpers: require('./views/helpers/main.js')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.engine('handlebars',handlebars.engine);
app.set('view engine', 'handlebars');

app.disable('x-powered-by');
app.set('port',process.env.PORT || 8080);

app.use(compression());

app.use(function(req,rsp,next){
	if(app.get('env') === 'production'){
		var env = require('dotenv').config();
		rsp.locals.production = true;
		rsp.locals.GATrackingID = (process.env.GA_TRACKING_ID)? process.env.GA_TRACKING_ID: 'null';
	} else {
		rsp.locals.showTests = (req.query.test === 1)?true:null;
		rsp.locals.production = null;
	}
	next();
});
app.use(breadcrumbs.init());
app.use(breadcrumbs.setHome());
app.use('/',breadcrumbs.setHome({
	name: 'Home',
	url: '/'
}));

//resource handling
app.use(express.static(__dirname+'/public'));

app.use(function(req,rsp,next){
	if(req.headers.purpose !== 'prefetch'){
		console.log('REQUEST::: '+new Date()+': '+req.url);		
	}
	next();
});

//routes
app.get('/',function(req,rsp){
	var wakaTimeline = require('./model/wakaTimeline.js');

	req.breadcrumbs('Dashboard','/');

	wakaTimeline.get(function(data){
		rsp.render('dashboard',{
			page: {
				title: 'Dashboard',
				description: 'Micah Kamla is a software developer in Houston, TX.',
				person: require('./model/whoami'),
				prefetch: ['/whoami','/contact'],
				activeNav: 'dashboard'
			},
			breadcrumbs: req.breadcrumbs(),
			jsGlobal: {
				wakatime: JSON.stringify(data)
			},
			dependencies: {
				js: [
					"/js/main.js"
				]
			}
		});
	});
});

app.get('/log',function(req,rsp){
	var posts = require('./model/posts.js');

	req.breadcrumbs('Log','/log');

	posts.scan('log',function(data){
		//fetch the first 3 log entries
		var prefetch = [];

		for(var i in data.Items){
			if(i > 3){
				break;
			}
			prefetch.push('/log/'+data.Items[i].url);
		}

		rsp.render('log',{
			page: {
				title: 'Log',
				description: 'Log Entries',
				person: require('./model/whoami'),
				prefetch: prefetch,
				activeNav: 'log',
				log: data,
			},
			breadcrumbs: req.breadcrumbs(),
			dependencies: {
				js: [
					'/js/main.js'
				]
			}
		});
	});
});

//log type sorting
app.get('/log/type/:tag',function(req,rsp){
	var posts = require('./model/posts.js'),
		queryObj = {'tags':req.params.tag};

	req.breadcrumbs('Log','/log');
	req.breadcrumbs(req.params.tag,'/log/type/'+req.params.tag);

	posts.findTags('log',queryObj,function(data){

		rsp.render('log',{
			page: {
				title: req.params.tag,
				description: req.params.tag+' log entries',
				person: require('./model/whoami'),
				prefetch: ['/whoami','/contact'],
				activeNav: 'log',
				log: data
			},
			breadcrumbs: req.breadcrumbs(),
			dependencies: {
				js: [
					'/js/main.js'
				],
				css: [
					'http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/styles/dracula.min.css'
				]
			}
		});
	});
});

//log entry route
app.get('/log/:url',function(req,rsp){
	var posts = require('./model/posts.js'),
		queryObj = {'url':req.params.url};

	req.breadcrumbs('Log','/log');
	// req.breadcrumbs(req.params.url,'/log/'+req.params.url);

	posts.find('log',queryObj,function(data){

		req.breadcrumbs(data.Items[0].title,'/log/'+req.params.url);

		rsp.render('logEntry',{
			page: {
				title: data.Items[0].title,
				description: data.Items[0].title,
				person: require('./model/whoami'),
				activeNav: 'log',
				entry: data
			},
			breadcrumbs: req.breadcrumbs(),
			dependencies: {
				js: [
					'/js/main.js',
					'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js'
				],
				css: [
					'/css/dracula.css'
				]
			}
		});
	});
});

app.get('/whoami',function(req,rsp){
	req.breadcrumbs('Whoami','/whoami');

	rsp.render('whoami',{
		page: {
			title: 'Whoami',
			description: 'About Micah Kamla',
			person: require('./model/whoami'),
			prefetch: ['/contact'],
			activeNav: 'whoami'
		},
		breadcrumbs: req.breadcrumbs(),
		dependencies: {
			js: [
				"/js/main.js"
			]
		}
	});
});

app.get('/contact',function(req,rsp){
	req.breadcrumbs('Contact','/contact');

	rsp.render('contact',{
		page: {
			title: 'Contact',
			description: 'Contact Micah Kamla',
			person: require('./model/whoami'),
			prefetch: ['/whoami'],
			activeNav: 'contact'
		},
		breadcrumbs: req.breadcrumbs(),
		dependencies: {
			js: [
				"/js/main.js"
			]
		}
	});
});

app.post('/api/contact',function(req,rsp){
	var email = require('./model/email.js');

	console.log(req.body);

	var emailResponse = email.validate(req.body);

	if(emailResponse.status !== 'error'){
		email.send(req.body,function(){
			rsp.json(emailResponse);
		});
	} else {
		rsp.json(emailResponse);
	}
});

//error handling
//404
app.use(function(req, rsp, next){
	rsp.type('text/plain');
	rsp.status(404);
	rsp.send('404 - Page not found');
});

//500 - server error
app.use(function(err, req, rsp, next){
	rsp.type('text/plain');
	console.log(err);
	rsp.status(500);
	rsp.send('500 - Server Error');
});

//listen
app.listen(app.get('port'),function(){
	console.log('Express started in '+app.get('env')+' mode on http://localhost:'+app.get('port')+'; Press Cntrl-C to terminate.');
});