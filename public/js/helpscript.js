this.exports = {
    complete: function() {
        $('.pull-right').html = '';
    },
    started: function() {
        $('.pull-right').html = '<p>Demo Uploading...</p><img src ="images/ajax-loader.gif">';
    }
};
/*
ADMIN.uploadComplete = function() {

};

ADMIN.uploadStarted = function () {

};
*/



/*
$('.form-horizontal').bind('ajax:complete', function() {
    window.location.href = '/';
});
*/

/*var req =  jQuery.post(
    "http://www.mysite.com:3000"+"/dologin",
    {"username" : username, "password" : password}, 'json').error(function(){
        alert("an error occurred");
    }).success(function(data) {
        window.location = data;
});*/

/*
goHome = function() {
    window.location = 'localhost:3000';
    uploadFinished = function() {
    };

    $('.loading-indicator').hide();
    $('.upload').show();
};
*/

/*
$(window).resize(function() {
    $('.demoIFrame').css('height', parseInt($('.demoIFrame').css('width'), 10) * .75 + 'px');
});

$(document).ready(function () {
    // Initial insert of Published information
    $('.demoIFrame').css('height', parseInt($('.demoIFrame').css('width'), 10) * .75 + 'px');
    if ($('#published')[0].value == 'true') {
        $('.publishing').html('<h4>Published (<a id="unpublishLink" href="#">Unpublish</a>)</h4>');
    }
    else {
        $('.publishing').html('<h4>Unpublished (<a id="publishLink" href="#">Publish</a>)</h4>');
    }

    // Handles Published to Unpublished
    $('#unpublishLink').live('click', function() {
        $('.publishing').html('<h4>Unpublished (<a id="publishLink" href="#">Publish</a>)</h4>');
        $('#published')[0].value = false;
        sendDemoSettings();
    });

    // Handles Unpublished to Published
    $('#publishLink').live('click', function() {
        $('.publishing').html('<h4>Published (<a id="unpublishLink" href="#">Unpublish</a>)</h4>');
        $('#published')[0].value = true;
        sendDemoSettings();
    });

    // handle ExpirationDate Edit
    $('#editExpiration').live('click', function () {
        $('div#expirationOption').html('<h4 id="saveBox"><input id="expText" type="text" value=' + $('#expirationDateValue')[0].value + '>(<a id="saveExpiration" href="#">Save</a>)</h4><br/>');
    });

    // handle ExpirationDate Save
    $('#saveExpiration').live('click', function() {
        $('div#expirationOption').html('<h4 id="expirationBox">' + $('#expText')[0].value + '(<a id="editExpiration" href="#">Edit</a>)</h4><br/>');
    });

    // handle Title Edit
    $('#editTitle').live('click', function () {
        $('#titleInformation').html('<h4 id="saveTitleBox"><input id="titleText" type="text" value="' + $('#title')[0].value + '">(<a id="saveTitle" href="#">Save</a>)</h4>');
    });

    // handle Title Save
    $('#saveTitle').live('click', function() {
        $('#title')[0].value = $('#titleText')[0].value
        $('#titleInformation').html('<h4 id="titleBox">' + $('#titleText')[0].value + '(<a id="editTitle" href="#">Edit</a>)</h4>');
        sendDemoSettings();
    });

    // handle UpdateDemoSettings button
    $('#submitter').click(function (event) {
        sendDemoSettings();
    });
*/
/*
    onResize = function() {
        $('.demoIFrame').attr('height', $('.demoIFrame').attr('width') *.75);
    }
    $(window).load('resize', onResize);
    $(window).bind('resize', onResize)*//*
;
});


function sendDemoSettings() {
    var url = "/demos/" + document.getElementById('id').value;
    var demoData = {
        "id": $('#id')[0].value,
        "title": $('#title')[0].value,
        "owner": $('#owner')[0].value,
        "uploadDate": $('#uploadDate')[0].value,
        "status": $('#status')[0].value,
        "published": $('#published')[0].value,
        "description":$('#Description')[0].value,
        "site": $('#site')[0].value,
        "urlKey": $('#urlKey')[0].value
    }
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(demoData),
        contentType: 'application/json',
        beforeSend: function(x) {
            if(x && x.overrideMimeType) {
                x.overrideMimeType("application/json;charset=UTF-8");
            }
        },
        complete: function() {
            console.log('process complete');
        },
        success: function (data, textStatus, jqXHR) {
            alert('Demo Settings Updated!');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("The following error occurred: " + textStatus, errorThrown);
        }
    });
}*/
