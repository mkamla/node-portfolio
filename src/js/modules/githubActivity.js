(function(w,$){

	var model = {},
		view = {},
		controller = {};

	model.range = {
		l: 0,
		h: 0,
	};

	view.dayNode = function(commitQt){
		return '<span class="day" data-commits="'+commitQt+'"></span>';
	};

	view.week = function(weekID){
		return $('<div class="week week-'+weekID+'"></div>');
	};

	view.legend = function(){
		var contents = '',
			days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

		var spanLegend = function(text){
			return '<span class="day"><span class="label">'+text.substring(0,1)+'</span></span>';		
		};

		for(var i in days){
			contents += spanLegend(days[i]);
		}

		return $('<div class="legend week">'+contents+'</div>');
	};

	controller.createActivityModule = function(target,data){
		// controller.mergeGitData();
		// data = w.github;
		target.append(view.legend);

		for(var weekTimestamp in data){
			var weekElement = view.week(weekTimestamp)

			target.append(weekElement);

			for(var day in data[weekTimestamp]['days']){
				
				var commitQt = data[weekTimestamp]['days'][day];

				if(model.range.h < commitQt){
					model.range.h = commitQt;
				}

				weekElement.append(view.dayNode(commitQt));
			}
		}
	};

	//merge github and gitlab data
	controller.mergeGitData = function(a,b){
		var timestamps = [],//start collecting timestamps (keys)
			d = Math.floor(new Date().getTime()/1000),
			aMax,aMin,weeksRecorded;

		var maxOfArray = function(array){
			return Math.max.apply(null,array);
		};

		var minOfArray = function(array){
			return Math.min.apply(null,array);
		};

		//merge two objects (b into a)
		for(var x in b){
			if(a.hasOwnProperty(x)){
				a[x].total += b[x].total;
				// if(a[x])
				for(var day in a[x].days){
					a[x].days[day] += b[x].days[day];
				}
			} else {
				a[x] = {
					total: b[x].total,
					days: b[x].days
				};
			}
		}

		for(var week in a){
			timestamps.push(parseInt(week,10));
		}

		//find the maximum week-ending timestamp from each data set
		aMax = maxOfArray(timestamps);
		aMin = minOfArray(timestamps);

		if(timestamps.length < 52){
			while(aMax <= d){
				aMax += 604800;//(7*86400) = week

				a[aMax] = {
					days: Array.apply(null, Array(7)).map(Number.prototype.valueOf,0),
					total: 0
				}
				timestamps.push(parseInt(aMax,10));
			}


			while(timestamps.length < 52){
				aMin -= 604800;
				a[aMin] = {
					days: Array.apply(null, Array(7)).map(Number.prototype.valueOf,0),
					total: 0	
				};
				timestamps.push(parseInt(aMin,10));
			}		
		}

		//trim weekly commit data that is older than one year
		if(timestamps.length > 52){
			//sort weekending timestamps (oldest to newest)
			timestamps.sort(function(a,b){
				return a-b;
			});

			for(var i=0;i<(timestamps.length-52);i++){
				var key = ""+timestamps[i];
				delete a[key];
			}
		}

		return a;
	};

	var init = function(){
		model.github = w.github;
		model.gitlab = w.gitlab;

		var mergedData = controller.mergeGitData(model.github,model.gitlab);

		controller.createActivityModule($('#git-activity'),mergedData);
	};

	if(!w.githubActivity){
		w.githubActivity = {
			init: init
		};
	}
}(window,jQuery));
