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
		console.log('creating activity view');
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
			aSize = 0,
			bSize = 0,
			aMax,bMax;

		var maxOfArray = function(array){
			return Math.max.apply(null,array);
		};

		var minOfArray = function(array){
			return Math.min.apply(null,array);
		};

		for(var y in a){
			var weekNum = parseInt(y,10),
				d = new Date(weekNum*1000);

			aTimestamps.push(y);
			aSize++;
			// console.log('Github key date conversion '+d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'');	
		}

		for(var x in b){
			var weekNum = parseInt(x,10),
				d = new Date(weekNum*1000);
			// console.log('Gitlab key date conversion '+d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'');			

			bTimestamps.push(x);
			bSize++;

			try{
				if((a[x])){
					// console.log('match at '+x);
				} else {
					// console.log('no match at '+x);
				}
			} catch (e){

			}

			if(a.hasOwnProperty(x)){
				a[x].total += b[x].total;
				// if(a[x])
				for(var day in a[x].days){
					a[x].days[day] += b[x].days[day];
				}
			}
		}

		//find the maximum week-ending timestamp from each data set
		aMax = maxOfArray(aTimestamps);
		bMax = maxOfArray(bTimestamps);

		//merge latest week-ending timestamp - we are merging arg "b" into arg "a", so there's no reason to leave an "else" statement to merge a into b in the event that a has a greater week-ending timestamp available - it will have already been established.
		if(!aTimestamps[Math.max(aMax,bMax)]){
			a[bMax] = b[bMax];

			//if more weeks than a year, trim the first index
			if(aSize >= 52){
				var key = minOfArray(aTimestamps);

				delete a[key];
			}
		}

		return a;
	};

	var init = function(){
		model.github = w.github;
		model.gitlab = w.gitlab;

		var mergedData = controller.mergeGitData(model.github,model.gitlab);

		console.log('mergedData');
		console.log(mergedData);
		controller.createActivityModule($('#git-activity'),mergedData);
	};

	if(!w.githubActivity){
		w.githubActivity = {
			init: init
		};
	}
}(window,jQuery));