var global_response;

function fetch_json() {
    //https://osf.io/hxeza/wiki
    chrome.extension.sendRequest({
        'action' : 'fetch_json', 
        'url' : 'https://osf.io/api/v1/search/?q=wx7ck'
    }, 
        function(response) {
            global_response = response;
            create_dropdown(response);
        }
    );
}

function fetch_files_json() {
    //https://osf.io/hxeza/wiki
    chrome.extension.sendRequest({
        'action' : 'fetch_files_json', 
        'url' : 'https://osf.io/api/v1/project/wx7ck/files/grid/'
    }, 
        function(response) {
            create_hgrid(response);
        }
    );
}

function fetch_proposal_text(url) {
    chrome.extension.sendRequest({
        'action' : 'fetch_proposal_text', 
        'url' : url
    }, 
        function(response) {
            parse_full_text(response);
        }
    );
}

function create_dropdown(response){
    var apiJSON = $.parseJSON(response);
    var name_item = '';

    for (i = 0; i < apiJSON.results[0].contributors.length; i++){
        name_item += '<option value="'+apiJSON.results[0].contributors_url[i]+'">';
        name_item += apiJSON.results[0].contributors[i];
        name_item += '</option>';
    }

    $("#osf_select").append(name_item);

    var selected_name = $("#osf_select option:selected").text();
    populate_name_version(selected_name);
}

function populate_name_version(name){
    var item = '';
    $('#osf_result').html('');

    var full_name = name;
    var split_name = full_name.split(" ");

    item += '<option value="full_name">'+full_name+'</option>';
    
    if (split_name[split_name.length-1] == "Jr." || split_name[split_name.length-1] == "Sr."){
        item += '<option value="first_initial">'+new String(split_name[0]).charAt(0)+'. '+new String(split_name[split_name.length-2].replace(/,/g , ""))+'</option>';
        item += '<option value="first_and_last">'+new String(split_name[0])+' '+new String(split_name[split_name.length-2].replace(/,/g , ""))+'</option>';
    }
    else{
        item += '<option value="first_initial">'+new String(split_name[0]).charAt(0)+'. '+new String(split_name[split_name.length-1])+'</option>';
        item += '<option value="first_and_last">'+new String(split_name[0])+' '+new String(split_name[split_name.length-1])+'</option>';
    }
    
    if (split_name.length == 3){
        item += '<option value="middle_initial>'+new String(split_name[0])+' '+new String(split_name[1]).charAt(0)+' '+new String(split_name[split_name.length-1])+'</option>';
    }

    $("#osf_result").append(item);
}

function prependURL(hgridJSON){
    var result = null;
    if(hgridJSON instanceof Array) {
        for(var i = 0; i < hgridJSON.length; i++) {
            result = prependURL(hgridJSON[i]);
        }
    }
    else
    {
        for(var prop in hgridJSON) {
            if(prop == 'urls') {
                if (typeof(hgridJSON[prop]['upload']) != 'undefined'){
                    hgridJSON[prop]['upload'] = "https:\/\/osf.io" + hgridJSON[prop]['upload'];
                }
                if (typeof(hgridJSON[prop]['download']) != 'undefined'){
                    hgridJSON[prop]['download'] = "https:\/\/osf.io" + hgridJSON[prop]['download'];
                }
                if (typeof(hgridJSON[prop]['delete']) != 'undefined'){
                    hgridJSON[prop]['delete'] = "https:\/\/osf.io" + hgridJSON[prop]['delete'];
                }
                if (typeof(hgridJSON[prop]['view']) != 'undefined'){
                    hgridJSON[prop]['view'] = "https:\/\/osf.io" + hgridJSON[prop]['view'];
                }
                //return hgridJSON;
            }
            if(hgridJSON[prop] instanceof Object || hgridJSON[prop] instanceof Array)
                result = prependURL(hgridJSON[prop]);
        }
        return hgridJSON;
    }
    return result;
}

function create_hgrid(response){
    var filesJSON = $.parseJSON(response);
    var fullURLJson = prependURL(filesJSON);

    var myGrid = new Rubeus('#myGrid', {
        data: fullURLJson,
        width: 500,
        height: 400,
        uploads: false,
        progBar: '#filetreeProgressBar',
        searchInput: '#fileSearch'
        //fetchUrl: function(folder) {
        //    return filesJSON + folder.name;
        //}
        });
}

function parse_full_text(response){
    //var textHTML = $.parseHTML(response);
    /*text_html = $(response).find("#fileRendered")[0].innerHTML;
    
    for (var i=0; i < $(text_html).filter(".pydocx-center").length; i++){
        console.log($(text_html).filter(".pydocx-center")[i]);
    }*/

    console.log(response);
}

function fill_json(){
    var apiJSON = $.parseJSON(global_response);
    var config = {
        osf_title : $("#osf_select option:selected").text(),
        osf_config: apiJSON
        };

        document.getElementById('fill_form')
        chrome.tabs.executeScript(null, {
            file: "js/jquery-2.1.1.js"
        });
        chrome.tabs.executeScript(null, {
            code: 'var config = ' + JSON.stringify(config)
        }, function(){
            chrome.tabs.executeScript(null, {file: "js/fill.js"});
        });
}

$(document).ready(function() {
    fetch_json();
    fetch_files_json();

    $("#osf_select").change(function(){
        var selected_name = $("#osf_select option:selected").text();
        populate_name_version(selected_name);
    });

    //e = event, e.target is the target at which the event is called on
    $("#myGrid").on("click", ".hg-item-name", function(e){
        var file_name = $(e.target).text();
        var url = 'https:\/\/osf.io\/wx7ck\/osffiles\/' + file_name.trim();
        fetch_proposal_text(url);
    });

    $("#fill_form").click(function(){
        fill_json();
    });
});