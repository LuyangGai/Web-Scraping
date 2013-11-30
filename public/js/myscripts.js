var reverser = 1;
var currentTeam;
var teams = {};
var projections = {};
var field;
var counter = 0;
var savedProjections = new Array();
var savedStats = new Array();
var nameHash = {};

$(function () {
    $('.proj').click(function() {
        var sortId = this.getAttribute('id');
        field = sortId.toUpperCase();
        projectionSort('#' + sortId);
    });
    
    $('.stat').click(function() {
        var sortId = this.getAttribute('id');
        field = sortId.toUpperCase();
        statSort('#' + sortId);
    });
});

var theSorter = function(a, b) {
    if(parseFloat(a[field]) > parseFloat(b[field]))
        return -1 * reverser;
    else if(parseFloat(a[field]) < parseFloat(b[field])) 
        return 1 * reverser;
    return 0;
};

var completeStatTable = function(stats) {
    for(var i = 0; i < stats.length; i++)
        insertPlayer(stats[i]);
};

var completeProjTable = function(projections) {
    for(var i = 0; i < projections.length; i++)
        insertProjection(projections[i], i);
};

var statSort = function(selector) {
    $('.stats').remove();
    var allResults = savedStats;
    
    console.log('theSort Hit');
    if ($(selector + ' i').hasClass('icon-chevron-up')) {
        reverser = -1;
        clearIcons();
        console.log('has up');
        $(selector + ' i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
    }
    
    else {
        reverser = 1;
        clearIcons();
        console.log('has down');
        $(selector + ' i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
    }
    allResults.sort(theSorter);
    completeStatTable(allResults);
};

var projectionSort = function(selector) {
    $('.projections').remove();
    var allResults = savedProjections;
    
    console.log('theSort Hit');
    if ($(selector + ' i').hasClass('icon-chevron-up')) {
        reverser = -1;
        clearIcons();
        console.log('has up');
        $(selector + ' i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
    }
    
    else {
        reverser = 1;
        clearIcons();
        console.log('has down');
        $(selector + ' i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
    }
    allResults.sort(theSorter);
    completeProjTable(allResults);
};

var clearIcons = function() {
    $('i').removeClass('icon-chevron-up').removeClass('icon-chevron-down');
};

var load = function(url, id) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            if (id)
                loadStatsCB(data, id);
            else
                loadProjsCB(data);
                
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('.error-text').append('<p>Unable to load data.</p>');
            if (window.console && window.console.log) {
                console.log(errorThrown);
            }
        }
    });
};

var loadStatsCB = function(data, id) {
    console.log('loadStatsCB called');
    teams = data;
    fillTeamQuickLink();
    fillStatTable(id);
    fillHeader(id);
}

var loadProjsCB = function(data) {
    console.log('loadProjsCB called');
    projections = data;
    fillProjectionsTable();
}

var fillProjectionsTable = function() {
    var projCounter = 1;
    console.log('fill table called!');
    console.log(projections);
    console.log('projections');
    for(var team in projections) {
        insertNewProjection(projections[team], projCounter);
        projCounter++;
    }
}  


var insertProjection = function(teamProjection, index) {
    var tr = $('<tr class="projections"/>');
    console.log(teamProjection);
    console.log(index);
    for (var stat in teamProjection) {
        if (stat == 'Name') {
            //$('<td/>').html(
            var link = $('<td/>').html(getAHtml(teamProjection[stat], '/teams/' + index));
            link.appendTo(tr);
        }
        else
            getTdHtml(teamProjection[stat].toFixed(2)).appendTo(tr);
    }
    tr.appendTo('#myTable');    
}

var insertNewProjection = function(teamProjection, index) {
    savedProjections[counter] = teamProjection;
    counter++;
    insertProjection(teamProjection, index);
}

var fillTeamQuickLink = function() {
    var firstTeam = true;
    var teamCounter = 1;
    for (var team in teams) {
        var name = teams[team]['Name'];
        var aName = getAHtml(name, '/teams/' + teamCounter);
        var liItem = getLiHtml();
        aName.appendTo(liItem);
        liItem.appendTo('.dropdown-menu');
        if (firstTeam) {
            getLiHtml().appendTo('.dropdown-menu');
            firstTeam = false;
        }
        teamCounter++;
    }
}

var fillStatTable = function(x) {
    console.log('fill table called!');
    var currentTeam = teams[x];
    for (var player in currentTeam)
        if (currentTeam[player]['FG'])
            insertNewPlayer(currentTeam[player]);
}   

var fillHeader = function(x) {
    $('h1').each(function() {
        $(this).text(teams[x]['Name']);
    });
}

var insertNewPlayer = function(player) {
    savedStats[counter] = player;
    counter++;
    insertPlayer(player);
}
    
var insertPlayer = function(player) {
    var tr = $('<tr class="stats"/>');
    for (var att in player) {
        if (att != 'Team') 
            getTdHtml(player[att]).appendTo(tr);
    }
    tr.appendTo('#myTable');
};

var getTdHtml = function(value) {
    return $('<td/>').text(value);
};

var getTdTeamLinkHtml = function() {
    
};

var getLiHtml = function() {
    return $('<li/>');    
}
var getAHtml = function(value, id) {
    return $('<a href = "' + id + '">' + value + '</a>');
};