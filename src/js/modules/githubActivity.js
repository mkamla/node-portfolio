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
		var aTimestamps = [],//start collecting timestamps (keys)
			bTimestamps = [],//start collecting timestamps (keys)
			d = Math.floor(new Date().getTime()/1000),
			aMax,bMax,weeksRecorded;

		var maxOfArray = function(array){
			return Math.max.apply(null,array);
		};

		var minOfArray = function(array){
			return Math.min.apply(null,array);
		};

		for(var x in b){
			bTimestamps.push(parseInt(x,10));

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
			aTimestamps.push(parseInt(week,10));
		}

		//find the maximum week-ending timestamp from each data set
		aMax = maxOfArray(aTimestamps);
		aMin = minOfArray(aTimestamps);

		while(aMax <= d){
			aMax += 604800;//(7*86400) = week

			a[aMax] = {
				days: Array.apply(null, Array(7)).map(Number.prototype.valueOf,0),
				total: 0
			}
		}

		weeksRecorded = Object.keys(a).length;

		while(weeksRecorded < 52){
			aMin -= 604800;
			a[aMin] = {
				days: Array.apply(null, Array(7)).map(Number.prototype.valueOf,0),
				total: 0	
			};

			weeksRecorded++;
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