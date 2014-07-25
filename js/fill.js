//alert('Example:' + config.osf_title);
//alert('Example:' + config.osf_description);

$('textarea[name="title"]').val(config.osf_title);

for (i = 0; i < config.osf_config.results.length; i++){
	config_title = new String(config.osf_config.results[i].title);
	if (config_title == config.osf_title && config.osf_config.results[i].description != null){
		$('#description').val(new String(config.osf_config.results[i].description));
		break;
	}
}