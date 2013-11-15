var request = require('request');
var cheerio = require('cheerio');

stats = ['FG', 'FG%', 'FT', 'FT%', '3PM', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PTS']
statsCounter = 0
testMax = 12;
teams = {}
calculateTotalRuns = 0;

runServer = function() {
	
	function askQuestion(question, callback) {
    	var stdin = process.stdin, stdout = process.stdout;

	    stdin.resume();
    	stdout.write(question + ": ");

    	stdin.once('data', function(data) {
        	data = data.toString().trim();
	        callback(data);
    	});
	}

	function handleOpen(response) {
    	if (response == "1") {
			calculateAllStats();
        	//process.exit();
    	}
		else if (response == "2") {
			askQuestion("What team would you like to see?\n", calculateStats);
			//calculate one team's average stats
		}
		else if (response == "3") {
			//show all team's players
		}
		else if (response == '4') {
			//show one team's players
		} 
    	else {
        	console.log('goodbye');
        	process.exit();
    	}
	}


	var userOpen = 'Welcome to FBBSE\nWhat would you like to do?\n1. Check all team averages\n2. Check individual team averages\n3. Check all team stats\n4. Check individual team stats\n5. Exit\n';
	askQuestion(userOpen, handleOpen);
	//handleOpen('1');
	
	var calculateStats = function(x) {
		getTeamData(x, function(x) {
			calculateTotals(x);
			printAverages();
			process.exit();
		});
	}


	var calculateAllStats = function() {
		//console.log('calculateStats called!');
		var callbackCounter = 0;
		for (var j = 1; j <= testMax; j++) {
			getTeamData(j, function(x) {
				//console.log('callback worked?');
				callbackCounter++;
				calculateTotals(x);
				if (callbackCounter == 12) {
					printAverages();			
					process.exit();
				}
			});
		}
	}
	
	var getTeamData = function(j, callback) {
		teams[j] = {};
        var url = 'http://games.espn.go.com/fba/clubhouse?leagueId=78232&teamId=' + j + '&seasonId=2014&view=stats&context=clubhouse&version=currSeason&ajaxPath=playertable/prebuilt/manageroster&managingIr=false&droppingPlayers=false&asLM=false';

        request(url, ( function(j) {
            return function(err, resp, body) {
                //console.log('request returned');
                if (err)
                    throw err;
                $ = cheerio.load(body);
                var playerName = '';
                $('title').each(function() {
                    //console.log($(this).text());
                	teams[j]['Name'] = $(this).text();
				});
                $('tr.pncPlayerRow').each(function() {
                    $('tr.pncPlayerRow a[tab$="null"]', this).each(function() {
						playerName = $(this).text();
                        teams[j][playerName] = {};
						//playerName = $(this).text();
                    });    
                    $('tr.pncPlayerRow[id*="plyr"] td.playertableStat ', this).each(function() {
                        var currentStat = stats[statsCounter%11];
                        teams[j][playerName][currentStat] = $(this).text();
                        statsCounter++;
                    });
                });
				callback(j);                
            }  
        })(j));
	}

	var calculateTotals = function(x) {
		//console.log('CalculateTotals called!');
		var playerCount = 0;
		var currentTeam = teams[x];
		calculateTotalRuns++;
		//console.log('Current team: ' + currentTeam);
		currentTeam['Averages'] = {
			'FGM': 0.0,
			'FGA': 0.0,
			'FG%': 0.0,
			'FTM': 0.0,
			'FTA': 0.0,
			'FT%': 0.0,
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
				var FGS = currentPlayer[stats[0]].split("/");
				//console.log(FGS[0] + '/' + FGS[1]);
				var FTS = currentPlayer[stats[2]].split('/');
				currentTeam['Averages']['FGM'] += parseFloat(FGS[0]);
				currentTeam['Averages']['FGA'] += parseFloat(FGS[1]);
				currentTeam['Averages']['FTM'] += parseFloat(FTS[0]);
				currentTeam['Averages']['FTA'] += parseFloat(FTS[1]);	
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
		
		currentTeam['Averages']['FG%'] = currentTeam['Averages']['FGM'] / currentTeam['Averages']['FGA'];
		currentTeam['Averages']['FT%'] = currentTeam['Averages']['FTM'] / currentTeam['Averages']['FTA'];	
		currentTeam['Averages']['Count'] = playerCount; 

		//if (calculateTotalRuns == testMax) {
			//printAverages();
		//}	
	}
	
	var printAverages = function() {
		for (var team in teams) {
			console.log(team);
			console.log(teams[team]['Averages']);	
		}
	}
}

exports.run = runServer;
