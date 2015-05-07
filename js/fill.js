//alert('Example:' + config.osf_title);
//alert('Example:' + config.osf_description);


//Content script which writes the information passed to it to the DOM

$('textarea[name="title"]').val(config.osf_title);

var name_full = config.osf_author;
var name_tokenized = name_full.split(" ");

if (name_tokenized.length === 3){
	$('[name="corr_auth_first_nm"]').val(name_tokenized[0]);
	$('[name="corr_auth_middle_nm"]').val(name_tokenized[1]);
	$('[name="corr_auth_last_nm"]').val(name_tokenized[2]);
}

else{
	$('[name="corr_auth_first_nm"]').val(name_tokenized[0]);
	$('[name="corr_auth_middle_nm"]').val("");
	$('[name="corr_auth_last_nm"]').val(name_tokenized[1]);
}

if (name_tokenized[3]){
	$('[name="corr_auth_suffix"]').val(name_tokenized[3]);
}

else{
	$('[name="corr_auth_suffix"]').val("");
}

$('[name="corr_auth_email"]').val("Email");
$('[name="corr_auth_org"]').val("Institution");
$('[name="corr_auth_dept"]').val("Department");
$('[name="corr_auth_city"]').val("City");
$('[name="corr_auth_phone"]').val("Phone Number");


/*for (i = 0; i < config.osf_config.results.length; i++){
	config_title = new String(config.osf_config.results[i].title);
	if (config_title == config.osf_title && config.osf_config.results[i].description != null){
		$('#description').val(new String(config.osf_config.results[i].description));
		break;
	}
}*/