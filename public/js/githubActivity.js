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
		for(var x in b){
			if(a.hasOwnProperty(x)){
				a[x].total += b[x].total;
				for(var day in a[x].days){
					a[x].days[day] += b[x].days[day];
				}
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