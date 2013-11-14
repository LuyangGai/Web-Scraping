var request = require('request');
var cheerio = require('cheerio');

stats = ['FG', 'FG%', 'FT', 'FT%', '3PM', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PTS']
statsCounter = 0
testMax = 12;
teams = {}
calculateTotalRuns = 0;

for (var j = 1; j <= testMax; j++) {
    teams[j] = {};
	var url = 'http://games.espn.go.com/fba/clubhouse?leagueId=78232&teamId=' + j + '&seasonId=2014&view=stats&context=clubhouse&version=currSeason&ajaxPath=playertable/prebuilt/manageroster&managingIr=false&droppingPlayers=false&asLM=false';
    
    request(url, ( function(j) {
        return function(err, resp, body) {
            if (err)
                throw err;
            $ = cheerio.load(body);	
			var playerName = '';			
			$('tr.pncPlayerRow').each(function() {	
				$('tr.pncPlayerRow a[tab$="null"]', this).each(function() {
					playerName = $(this).text();
					teams[j][playerName] = {};
				});     
				$('tr.pncPlayerRow[id*="plyr"] td.playertableStat ', this).each(function() {
					var currentStat = stats[statsCounter%11];
					teams[j][playerName][currentStat] = $(this).text(); 
					statsCounter++;
				});


    		});
			calculateTotals(j);

		}	
    })(j));

}

var calculateTotals = function(x) {
	var playerCount = 0;
	var currentTeam = teams[x];
	calculateTotalRuns++;
	teams[x]['Averages'] = {
		'3PM': 0.0,
		'REB': 0.0,
		'AST': 0.0,
		'STL': 0.0,
		'BLK': 0.0,
		'TO': 0.0,
		'PTS': 0.0,
		'Count': 0
	}
	for (var player in currentTeam) {
		var currentPlayer = currentTeam[player];
		if (currentTeam[player][stats[0]] && currentTeam[player][stats[4]] != '--') {
			playerCount += 1;
			currentTeam['Averages']['3PM'] += parseFloat(currentPlayer[stats[4]]);
			currentTeam['Averages']['REB'] += parseFloat(currentPlayer[stats[5]]);
			currentTeam['Averages']['AST'] += parseFloat(currentPlayer[stats[6]]);
			currentTeam['Averages']['STL'] += parseFloat(currentPlayer[stats[7]]);
			currentTeam['Averages']['BLK'] += parseFloat(currentPlayer[stats[8]]);
			currentTeam['Averages']['TO'] += parseFloat(currentPlayer[stats[9]]);
			currentTeam['Averages']['PTS'] += parseFloat(currentPlayer[stats[10]]);
		}
	}
	
	for (var stat in currentTeam['Averages']) {
		currentTeam['Averages'][stat] /= playerCount;
	}

	currentTeam['Averages']['Count'] = playerCount; 

	if (calculateTotalRuns == testMax) {
		printAverages();
	}
}


var printAverages = function() {
	for (var team in teams) {
		console.log(team);
		console.log(teams[team]['Averages']);	
	}
}
