(function($,window){
	'use-strict';
	var model = {},
		view = {},
		controller = {},
		config = {
			//Configuration Defaults
			actionURL: 'console',
			sendSuccess: view.sendSuccess
		};

	//private functions

	model.formData = {};
	model.validateField = function(data,formElement,fieldType,fieldName){
		if(formElement==='INPUT' && fieldType!== 'submit'){
			switch(fieldType){
				case 'text':
					if(data.length > 1){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);					
					}
					break;
				case 'email':
					if(data.length >= 6 && data.indexOf('@')> -1){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);					
					}
					break;
				case 'tel':
					if(data.length >= 7){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);					
					}
					break;
				case 'checkbox':
					if(data.length){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);
					}
					break;
				case 'radio':
					if(data.length){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);
					}
					break;
				default:
					if(data.length){
						model.formData[fieldName] = data;
					} else {
						model.validateFieldError(fieldName);
					}
					break;
			}
		} else if (formElement==='TEXTAREA' || formElement==='SELECT'){
			if(data.length){
				model.formData[fieldName] = data;
			} else {
				model.validateFieldError(fieldName);
			}
		} else {
			//unknown or unsupported form element warning message
			console.log('Warning: '+formElement+' type="'+fieldType+'" isn\'t supported as a required field');
		}
		
	};

	model.validateFieldError = function(fieldName){
		console.log(fieldName+' not valiated');
		model.validated = false;
		controller.enableSubmit();
		view.validationError(fieldName);
		// return false;
	};

	model.submit = function(data){	
		//Sending form data to server'
		if(config.actionURL==='console'){
			for (var i in data){
				console.log('Sending form data: '+data[i]);	
			}
		} else {
			$.ajax({
				type: 'POST',
				url: config.actionURL,
				data: data,
				success:  function(data){
					config.sendSuccess(data);
				},
				error: function(){
					view.sendError();
					return false;
				}
			});
		}		
		view.clearForm();
		controller.enableSubmit();
	};

	model.validate = function(form){
		var requiredFields = {},
		formField = view.form.find('input,select,textarea');

		model.validated = undefined;
		controller.disableSubmit();
		view.removeErrorClass();

		$.each(formField,function(){
			var field = $(this),
				formElement = $(this).prop('tagName'),
				fieldName = field.attr('name'),
				fieldValue = field.val(),
				fieldClass = field.attr('class'),
				fieldType = field.attr('type'),
				fieldValidation;

			if(fieldClass){
				fieldClass = fieldClass.split(' ');
				for(var i in fieldClass){
					if(fieldClass[i]==='required'){
						fieldValidation = true;
					}
				}
			}

			if(fieldValidation){
				model.validateField(fieldValue,formElement,fieldType,fieldName);
			} else {
				//field validation not required on form element and field is not a submit or reset element
				if(fieldValue.length && fieldType!=='submit' && fieldType!=='reset'){
					//if field has value
					model.formData[fieldName] = fieldValue;
				}	
			}
		});

		if(typeof(model.validated)==='undefined' && model.validated!== false){
			// Submit the form data
			model.submit(model.formData);
		} else {
			view.focusOnError();
		}
	};

	var modelPublic = {
		submit: model.submit,
		validate: model.validate
	};


	//---VIEW
	view.focusOnError = function(){
		view.form.find('.input-error:first-child').focus();
	};

	view.hideForm = function(){
		view.form.hide();
	};

	view.showForm = function(){
		if($('.form-success').length){
			$('.form-success').remove();
		}
		view.form.show();
	};

	view.clearForm = function(){
		var formField = view.form.find('input[type="text"],input[type="email"],textarea');

		$.each(formField,function(){
			var field = $(this);
			field.val('');
		});
	};

	view.pending = function(){
		var submitBtn = view.form.find('input[type="submit"]');

		view.form.addClass('pending');
		submitBtn.html('Sending...');
	};

	view.active = function(){
		var submitBtn = view.form.find('input[type="submit"]');
		view.form.removeClass('pending');
		submitBtn.html('Send');	
	};

	view.removeErrorClass = function(){
		view.form.find('input, textrea').removeClass('input-error');
	};

	view.validationError = function(fieldName){
		view.form.find('[name="'+fieldName+'"]').addClass('input-error');
	};

	view.sendError = function(){
		console.log('There was an error sending form data to the server');
	};

	view.sendSuccess = function(){
		view.hideForm();
		self.form.after('<div class="form-success"><h2>Thank you!</h2><h3>Your message was successfully sent.</h3><a href="#" class="btn">Okay!</a></div>');
		$('.form-success .btn').on('click',function(e){
			e.preventDefault();
			view.removeErrorClass();
			view.showForm();
		});
	};

	var viewPublic = {
		hideForm: view.hideForm,
		showForm: view.hideForm,
		clearForm: view.clearForm,
		removeErrorClass: view.removeErrorClass,
		validationError: view.validationError,
		sendError: view.sendError
	};


	//--CONTROLLER

	controller.formSubmit = function(e){
		e.preventDefault();
		view.pending();
		model.validate(view.form);
	};

	controller.disableSubmit = function(){
		view.submitBtn.unbind('click').addClass('disabled');
	};

	controller.enableSubmit = function(){
		view.submitBtn.bind('click',function(e){
			controller.formSubmit(e);
		}).removeClass('disabled');
	};

	var controllerPublic = {
		formSubmit: controller.formSubmit
	};


	var init = function(target,options){
		view.form = $(target);
		view.formParent = $(target).parent();
		view.submitBtn = view.form.find('input[type="submit"]');

		$.extend(config,options);

		if(view.submitBtn){
			controller.enableSubmit();
		}
	};

	// public methods and properties
	var formModule = {
		model: modelPublic,
		view: viewPublic,
		controller: controllerPublic,
		init: init
	};

	//transport
	if(typeof(define) === 'function' && define.amd){
		//AMD
		define(formModule);
	} else if (typeof(exports)==='object'){
		//CommonJS
		module.exports = formModule;
	} else {
		//browser global
		window.formModule = formModule;
	}
}(jQuery,window));