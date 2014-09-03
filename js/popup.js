var global_response;

// Sends a request at the url passed to grab the callback response. This response will contain data of an OSF Project
function fetch_json(project_id) {
    //https://osf.io/hxeza/wiki
    chrome.extension.sendRequest({
        'action' : 'fetch_json', 
        'url' : 'https://osf.io/api/v1/search/?q=' + project_id
    }, 
        function(response) {
            global_response = response;
            create_user_dropdown(response);
        }
    );
}

// Sends a request at the url passed to grab the callback response. This response will contain data of the files of the respective OSF Project
function fetch_files_json(project_id) {
    //https://osf.io/hxeza/wiki
    chrome.extension.sendRequest({
        'action' : 'fetch_files_json', 
        'url' : 'https://osf.io/api/v1/project/' + project_id + '/files/grid/'
    }, 
        function(response) {
            create_hgrid(response);
        }
    );
}

// Sends a request at the url passed to grab the callback response. This response will contain data of one of the individual files
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

//Generates the dropdown menu of names in the popup
function create_user_dropdown(response){
    $("#osf_select").empty();
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

//Fills the dropdown menu of the contributors who worked on the same OSF project
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

//Prepends all file URL with "https://osf.io" so that the links associated with the file have a place to go
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
                //console.log(hgridJSON);
                //return hgridJSON;
            }
            if(hgridJSON[prop] instanceof Object || hgridJSON[prop] instanceof Array)
                result = prependURL(hgridJSON[prop]);
        }
        return hgridJSON;
        //console.log(hgridJSON);
    }
    return result;
}

function onClickName(evt, row, grid) {
    if (row) {
        var viewUrl = grid.getByID(row.id).urls.view;
        if (viewUrl) {
            chrome.tabs.create({url: viewUrl});
            //window.location.href = viewUrl;
        }
    }
}

function onClickFolderName(evt, row, grid) {
    onClickName(evt, row, grid);
    if (row && row.kind === HGrid.FOLDER && row.depth !== 0) {
        grid.toggleCollapse(row);
    }
}

function onClickButton(evt, row, grid) {
    if (row) {
        var downloadUrl = grid.getByID(row.id).urls.download;
        if (downloadUrl) {
            chrome.tabs.create({url: downloadUrl});
            //window.location.href = viewUrl;
        }
    }
}

//Creates the Hgrid containing all the files
function create_hgrid(response){

    var filesJSON = $.parseJSON(response);
    var fullURLJson = prependURL(filesJSON);

    var myHGrid = new Rubeus('#myGrid', {
        data: fullURLJson,
        columns: [HGrid.Col.Name, 
            HGrid.Col.ActionButtons],
        width: 500,
        height: 400,
        uploads: false,
        listeners: [
            // Go to file's detail page if name is clicked
            {
                on: 'click',
                selector: '.' + HGrid.Html.itemNameClass,
                callback: onClickName
            },
            // Toggle folder collapse when text is clicked; listen on text
            // rather than name to avoid Chrome crash on <select>s
            {
                on: 'click',
                selector: '.' + Rubeus.Html.folderTextClass,
                callback: onClickFolderName
            },
            {
                on: 'click',
                selector: '.' + HGrid.Html.buttonClass,
                callback: onClickButton
            }
        ],
        downloadUrl: function(row) {
            return myHGrid.grid.getByID(row.id).urls.download;
        },
        progBar: '#filetreeProgressBar',
        searchInput: '#fileSearch'
        //fetchUrl: function(folder) {
        //    return filesJSON + folder.name;
        //}
    });
}

//Currently, this logs the corrected file URL
function parse_full_text(response){
    //var textHTML = $.parseHTML(response);
    /*text_html = $(response).find("#fileRendered")[0].innerHTML;
    
    for (var i=0; i < $(text_html).filter(".pydocx-center").length; i++){
        console.log($(text_html).filter(".pydocx-center")[i]);
    }*/

    console.log(response);
}

function save_project(project_id){
    chrome.storage.local.set({'project_id': project_id});
}

function save_name(selected_name){
    chrome.storage.local.set({'selected_name': selected_name});
}

function save_version_name(version_name){
    chrome.storage.local.set({'version_name': version_name});
}

function load_project(){
    var project_id = "";

    chrome.storage.local.get('project_id', function (result) {
        project_id = result.project_id;
        $('#osf_project').val(project_id);

        fetch_json(project_id);
        fetch_files_json(project_id);

        //load_names();
    });
}

function load_names(){
    var selected_name_val = "";

    chrome.storage.local.get('selected_name', function (result) {
        selected_name_val = result.selected_name;
        $("#osf_select").val(selected_name_val);
        populate_name_version($("#osf_select option:selected").text());

        //load_names_version();
    });
}

function load_names_version(){
    var version_name = "";

    chrome.storage.local.get('version_name', function (result) {
        version_name_val = result.version_name;
        $("#osf_result").val(version_name_val);
    });
}

//Passes the information from the poppup to the content script for it to load into the page
function fill_json(){
    var apiJSON = $.parseJSON(global_response);
    var config = {
        osf_title : $("#osf_project option:selected").text(),
        osf_author : $("#osf_select option:selected").text(),
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
    load_project();
    window.setTimeout(function() {
        load_names();
        window.setTimeout(function(){
            load_names_version();
        }, 300);
    }, 800);
    
    $("#osf_project").change(function(){
        var project_id = $('#osf_project option:selected').val();
        fetch_json(project_id);
        fetch_files_json(project_id);
        save_project(project_id);
    });

    $("#osf_select").change(function(){
        var selected_name = $("#osf_select option:selected").text();
        populate_name_version(selected_name);
        save_name($("#osf_select option:selected").val());
    });

    $("#osf_result").change(function(){
        var version_name = $("#osf_result option:selected").val();
        save_version_name(version_name);
    });

    //e = event, e.target is the target at which the event is called on
/*    $("#myGrid").on("click", ".hg-item-name", function(e){
        var file_name = $(e.target).text();
        var url = 'https:\/\/osf.io\/wx7ck\/osffiles\/' + file_name.trim();
        fetch_proposal_text(url);
    });*/

    $("#fill_form").click(function(){
        fill_json();
    });
});