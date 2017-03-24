suite('Global Tests',function(){
	test('Page has valid title',function(){
		assert(document.title && document.title.match(/\S/));
	});
});