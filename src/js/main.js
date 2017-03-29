(function(window,$){
	var settings = {},
		model = {},
		view = {},
		controller = {},
		helper = {},
		WebFontConfig = {
			google: { families: ['Roboto+Mono:300:latin','Roboto:300,500:latin']}
		};

	if(!window.wakatime){
		window.wakatime = {
			start: 0,
			end: 0
		};
	}

	model.pointStartTimeOffset = function(){
		try{
			var string = wakatime.start,
				index = string.indexOf('T'),
				timeArray = string.substr(index+1,8).split(':');

			for(var i in timeArray){
				timeArray[i] = parseInt(timeArray[i],10);
			}

			return (timeArray[0]*3600000)+(timeArray[1]*60000)+(timeArray[2]*1000);
		} catch (err){
			new Error(err);
		}
		
	};

	model.wakatime = function(){
		var dataSeries = [];
		try {
			for(var i in wakatime.data){
				dataSeries.push(wakatime.data[i].grand_total.total_seconds/3600);
			}
		} catch(err){
			console.log(err);
		}

		return dataSeries;
	};

	model.wakatimeLanguageBreakdown = function(wakaData){
		var total = 0,
			languagesObj = {};

		try {
			for(var i in wakaData.data){
				for(var language in wakaData.data[i].languages){
					var languageName = wakaData.data[i].languages[language].name;

					if(!languagesObj.hasOwnProperty(languageName)){
						languagesObj[languageName] = {
							time: 0
						};
					}

					total += wakaData.data[i].languages[language].total_seconds;
					languagesObj[languageName].time += wakaData.data[i].languages[language].total_seconds;
				}
			}
		} catch (err){
			console.log(err);
		}
		

		return {
			total: total,
			languages: languagesObj
		};
	};

	model.IDEBreakdown = function(wakaData){
		if(!wakaData){
			return false;
		} else {
			var total = 0,
				IDEObj = {};

			for(var i in wakaData.data){
				for(var editor in wakaData.data[i].editors){
					var editorName = wakaData.data[i].editors[editor].name;

					if(!IDEObj.hasOwnProperty(editorName)){
						IDEObj[editorName] = {
							time: 0
						};
					}

					total += wakaData.data[i].editors[editor].total_seconds;
					IDEObj[editorName].time += wakaData.data[i].editors[editor].total_seconds;
				}
			}

			return {
				total: total,
				editors: IDEObj
			};
		}
	};

	model.languageSeries = function(wakaData){
		if(!wakaData){
			return false;
		} else {

			var series = [];

			series.push({
				name: 'Languages',
				colorByPoint: true,
				innerSize: '70%',
				data: []
			});


			for(var i in wakaData.languages){
				series[0].data.push({
					name: i,
					y: (wakaData.languages[i].time/wakaData.total)*100
				});
			}

			//sort values in descending order
			series[0].data.sort(function(a,b){
				if(a.y < b.y){
					return 1;
				} else if (a.y > b.y){
					return -1;
				} else {
					return 0;
				}
			});

			return series;
		}
	};

	model.IDESeries = function(wakaData){
		if(!wakaData){
			return false;
		} else {
			var series = [];

			series.push({
				name: 'Editor',
				colorByPoint: true,
				innerSize: '70%',
				data: []
			});

			for(var i in wakaData.editors){
				series[0].data.push({
					name: i,
					y: (wakaData.editors[i].time/wakaData.total)*100
				});
			}

			//sort values in descending order
			series[0].data.sort(function(a,b){
				if(a.y < b.y){
					return 1;
				} else if (a.y > b.y){
					return -1;
				} else {
					return 0;
				}
			});

			return series;
		}
	};

	view.githubActivity = function(target){
		var activityChartEl = $('<div class="activity-chart"></div>');
		target.append(activityChartEl);
	};

	view.githubActivityCreateNode = function(col,row,className){
		var item = $(target).find('.col:nth-child('+col+') .day:nth-child('+row+')');
		item.addClass(className);
	};

	view.updateMainView = function(view){
		var mainViewContainer = $('main.content'),
			existingView = mainViewContainer.find('div'),
			newView = $(view);

		newView.addClass('active');
		mainViewContainer.prepend(newView);
		existingView.on(transitionEnd,function(){

		}).addClass('inactive');
		//remove existingView from DOM and update class for newView on end of animation
	};

	view.highchartsSettings = {
		chart: {
			type: 'areaspline'
		},
		title: {
			 text: false
		},
		xAxis: {
			type: 'datetime',
			labels: {
				overflow: 'justify'
			},
			tickColor: '#2d3952'
		},
		yAxis: {
			title: {
				text: 'Hours'
			},
			tickColor: '#2d3952',
			minorGridLineWidth: 1,
			gridLineWidth: 1,
			gridLineColor: '#2d3952',
			alternateGridColor: null,
		},
		tooltip: {
			valueSuffix: ' hrs',
			formatter: function(){
				var timeValue = this.y,
					minutesTotal = Math.round(timeValue*60),
					hours = Math.floor(minutesTotal/60),
					minutes = minutesTotal%60,
					d = new Date(this.x),
					offset = d.getTimezoneOffset()*60000,
					dateObj = new Date(d.getTime()+model.pointStartTimeOffset()),
					year = dateObj.getFullYear(),
					month = dateObj.getMonth(),
					date = dateObj.getDate(),
					day = dateObj.getDay();
				
				var monthAbv = function(index){
					var monthList = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
					return monthList[index];
				};

				var dayAbv = function(index){
					var dayList = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
					return dayList[index];
				};
				
				return dayAbv(day)+'. '+monthAbv(month)+'. '+date+', '+year+'<br />Time: <b>'+hours+' hr '+minutes+' min</b>';
			}
		},
		plotOptions: {
			series: {
				shadow: true
			},
			areaspline: {
				lineWidth: 5,
				states: {
					hover: {
						lineWidth: 5
					}
				},
				color: {
					linearGradient: {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1
					},
					stops: [
						[0, Highcharts.getOptions().colors[0]],
						[1, Highcharts.getOptions().colors[1]]
					]
				},
				marker: {
					fillColor: Highcharts.Color(Highcharts.getOptions().colors[4]).setOpacity(0).get('rgba'),
					enabled: true,
					radius:6,
					lineWidth: 2,
					lineColor: '#fff200'
				},
				pointInterval: 86400000,// one day
				pointStart: new Date(wakatime.start).getTime()-model.pointStartTimeOffset()
			}
		},
		series: [{
			shadow: {
				// color: ''
				offsetX: 1,
				offsetY: 6,
				opacity: 0.15,
				width: 5
			},
			name: 'Time coding',
			data: model.wakatime()

		}],
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	};

	Highcharts.getOptions().plotOptions.pie.colors = (function () {
		var colors = [],
			base = Highcharts.getOptions().colors[1],
			altBase = Highcharts.getOptions().colors[0],
			i;

		for (i = 0; i < 10; i += 1) {
			if(i === 0){
				colors.push(altBase);
			} else if(i <= 2) {
				colors.push(Highcharts.Color(Highcharts.getOptions().colors[5]).setOpacity(i/2).get());
				// colors.push(Highcharts.getOptions().colors[5]);
			} else {
				// colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
				colors.push(Highcharts.Color(base).setOpacity((13-i)/12).get('rgba'));
			}
			// Start out with a darkened base color (negative brighten), and end
			// up with a much brighter color
		}
		return colors;
	}());

	view.PieSettings = {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie',
			borderColor: 'transparent',
			borderWidth: '0',
			plotBorderColor: 'pink'
		},
		xAxis: {
			lineColor: 'transparent',
			gridLineColor: 'pink'
		},
		yAxis: {
			lineColor: 'transparent',
			gridLineColor: 'pink'
		},
		title: {
			text: false
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: 'black'
					}
				}
			}
		}
		// series: model.languageSeries(model.wakatimeLanguageBreakdown(window.wakatime))
	};

	view.IDEPieSettings = {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie',
			borderColor: 'transparent',
			borderWidth: '0',
			plotBorderColor: 'pink'
		},
		xAxis: {
			lineColor: 'transparent',
			gridLineColor: 'pink'
		},
		yAxis: {
			lineColor: 'transparent',
			gridLineColor: 'pink'
		},
		title: {
			text: false
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: 'black'
					}
				}
			}
		}
		// series: model.IDESeries(model.IDEBreakdown(window.wakatime))
	};

	view.formSuccess = function(formData){
		var formEl = $('.contact-form');
	};

	view.formError = function(errorData){
		var formEl = $('.contact-form');

		for(var error in errorData){
			if(errorData[error].code === '04'){
				//server error
				formEl.prepend('<p>There was a problem sending your message. Please try again.</p>');
				return;
			} else {
				var invalidInput = formEl.find('*[name='+errorData[error].fieldName+']');
			
				invalidInput.addClass('error').val('').attr('placeholder',errorData[error].message);
			}
		}

		//focus on first error
		formEl.find('.error:first-of-type').focus();
	};

	view.makeCharts = function(){
		$.each($('.chart'),function(){
			var el = $(this),
				container = $('<div></div>');

			el.append(container);

			switch(el.attr('id')){
				case 'code-output':
					$('#code-output div').highcharts(view.highchartsSettings);
					break;
				case 'language':
					$('#language div').highcharts(view.PieSettings);
					break;
				case 'ide':
					$('#ide div').highcharts(view.IDEPieSettings);
					break;
				default:
					break;
			}
		});
	};

	controller.createActivityPanel = function(gitHubData){
		for(var i in gitHubData){
			for(var day in gitHubData[i].days){
				view.createDay();
			}
		}
	};

	controller.validateContactForm = function(rsp){
		console.log(rsp);
		if(rsp.length || rsp.status === 'ok'){
			view.formSuccess(rsp.data);
		} else {
			view.formError(rsp.errors);
		}
	};

	controller.timeSince = function(element,interval){
		var now = new Date().getTime()+new Date().getTimezoneOffset(),
			totalTime,
			elements = {},
			dict = {
				yrs: 31556952000,
				days: 86400000,
				hrs: 3600000,
				min: 60000,
				sec: 1000
			},
			time = {
				calc: function(){
					var total = 0;
					for(var i in elements){
						if(typeof elements[i] !== 'function'){
							total += elements[i].val*dict[i];
						}
					}
					return total;
				}
			};

		//set elements object
		$.each(element.find('span'),function(){
			var el = $(this),
				className = el.attr('class');

			if(className !== 'label'){
				elements[className] = {
					el: el,
					val: parseInt(el.data(className),10)
				};
			}
		});

		//tally total time from DOM
		totalTime = time.calc();

		var update = function(b){
			for(var i in elements){
				for(var x in b){
					// console.log('if '+x+' === '+i);
					if(x === i){
						if(elements[i].val !== b[x]){
							// console.log('updating '+i+' to '+b[x]);
							elements[i].el.html(b[x]+' '+i);
							elements[i].val = b[x];
						}
					}
				}
			}
		};

		var timeJob = window.setInterval(function(){
			totalTime += interval;

			var newTime = totalTime,
				newTimeObj = {};

			//take total time, minus interval. That value needs to be converted to an object. Compare this object with the 'elements' object. Fire DOM rewrite if they do not match;
			// console.log('updated time since');
			for(var i in elements){
				var value = Math.floor(newTime/dict[i]);
				
				newTimeObj[i] = value;

				newTime -= value*dict[i];
			}

			update(newTimeObj);
		},interval);

	};

	controller.navClick = {
		set: function(){
			$('nav ul > li > a').on('click',function(e){
				//for each a
				//load in partial view, animate current view out
			});
		},
		contact: function(){
			//get contact view, then render and animate out current view
			view.updateMainView();
		}
	};

	var init = function(){
		window.WebFontConfig = WebFontConfig;

		if($('form.contact-form').length){
			formModule.init('form.contact-form',{
				actionURL: '/api/contact',
				sendSuccess: controller.validateContactForm
			});
		}

		if($('.Dashboard').length){
			var asyncCalls = 2,
				completed = 0;

			var initGitActivity = function(){
				completed++;

				if(completed >= asyncCalls){
					window.githubActivity.init();
				}
			};

			//set series data
			view.IDEPieSettings.series = model.IDESeries(model.IDEBreakdown(window.wakatime));
			view.PieSettings.series = model.languageSeries(model.wakatimeLanguageBreakdown(window.wakatime));

			// setTimeout(function(){
			view.makeCharts();
			// },600);

			$.ajax({
				url: 'https://s3-us-west-2.amazonaws.com/mkamla-web-app/api/github.json',
				type: 'GET',
				dataType: 'JSON',
				crossDomain: true,
				success: function(rsp){
					if(rsp){
						window.github = rsp;
						initGitActivity();
					}
				}
			});

			$.ajax({
				url: 'https://s3-us-west-2.amazonaws.com/mkamla-web-app/api/gitlab.json',
				type: 'GET',
				dataType: 'JSON',
				crossDomain: true,
				success: function(rsp){
					if(rsp){
						window.gitlab = rsp;
						initGitActivity();
					}
				}
			});		
		}

		if($('.time-since').length){
			controller.timeSince($('.time-since'),1000);
		}

		if($('.log-entry').length && $('pre code').length){
			hljs.initHighlightingOnLoad();
		}

		(function() {
			var wf = document.createElement('script');
				wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
				wf.type = 'text/javascript';
				wf.async = 'true';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(wf, s);
		})();
	};

	$(document).ready(function(){
		$('body').addClass('ready');
		init();
	});
})(window,jQuery);