var request = require('request');
var cheerio = require('cheerio');

var stats = ['FG', 'FG%', 'FT', 'FT%', '3PM', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PTS'];
var statsCounter = 0;
var testMax = 12;
var teams = {};
var calculateTotalRuns = 0;
var schedule = {};
var projections = {};

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
    
    function cbackFunc(tNum) {
        getAllSOS(parseFloat(tNum), getTeamSOS);    
    }

	function handleOpen(response) {
    	if (response == "1") {
			calculateAllStats(process.exit);
    	}
		else if (response == "2") {
			askQuestion("Team Number?\n", calculateStats);
			//calculate one team's average stats
		}
		else if (response == "3") {
			//show all team's players
			showAllTeamStats();			
		}
		else if (response == '4') {
			//show one team's players
			askQuestion("Team number?\n", showTeamStats);	
		} 
        else if (response == '5') {
            calculateAllStats();
            askQuestion('Team number?', cbackFunc);
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


	var calculateAllStats = function(callback) {
		//console.log('calculateStats called!');
		var callbackCounter = 0;
		for (var j = 1; j <= testMax; j++) {
			getTeamData(j, function(x) {
				//console.log('callback worked?');
				callbackCounter++;
				calculateTotals(x);
				if (callbackCounter == 12) {
					//printAverages();
                    if (callback)
					   callback();
				}
			});
		}
	}

	var showTeamStats = function(x) {
		getTeamData(x, function(x) {
			console.log(teams[x]);
			process.exit();
		});
	}

	var showAllTeamStats = function() {
		for (var j = 1; j <= testMax; j++) {
			getTeamData(j, function(x) {
				console.log(teams[j]);
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
				//var playerString = '';
                $('title').each(function() {
                    //console.log($(this).text());
                	teams[j]['Name'] = $(this).text();
				});
                $('tr.pncPlayerRow').each(function() {
                   	$('tr.pncPlayerRow a[tab$="null"]', this).each(function() {
						playerName = $(this).text();
                        teams[j][playerName] = {};	
                    });
   
					$('td.playertablePlayerName', this).each(function() {
						var playerString = $(this).text();
						var playerArray = (playerString.split(' '))[3];		
						teams[j][playerName]['Team'] = playerArray.substring(0, 3);	
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
                
                var statLoopCounter = 0;
                    //loop through stats for each player
                for (var stat in currentPlayer) {
                    if (statLoopCounter > 4) {
                        currentTeam['Averages'][stat] += parseFloat(currentPlayer[stat]);    
                    }
                    statLoopCounter++;
                } 
			}
		}
		for (var stat in currentTeam['Averages']) {
			currentTeam['Averages'][stat] /= playerCount;
		}
		
		currentTeam['Averages']['FG%'] = currentTeam['Averages']['FGM'] / currentTeam['Averages']['FGA'];
		currentTeam['Averages']['FT%'] = currentTeam['Averages']['FTM'] / currentTeam['Averages']['FTA'];	
		currentTeam['Averages']['Count'] = playerCount; 
	}
	
	var printAverages = function() {
		for (var team in teams) {
			console.log(team);
			console.log(teams[team]['Averages']);	
		}
	}

    var getAllSOS = function(teamNum, callback) {
        var url = 'http://espn.go.com/fantasy/basketball/story/_/id/9981540/fantasy-basketball-forecaster-nov-18-24-lineup-advice-quality-matchups';			
        request(url, ( function(teamNum, callback) {
            return function(err, resp, body) { 
                if (err)
                    throw err;
                $ = cheerio.load(body);
                $('tbody').first().each(function() {
                    var isClippers = true;
                    $('tr.last', this).each(function() {
                        var oNum = 0;
                        var teamName;
                        $('td > b', this).each(function() {
                            if (oNum == 0) {
                                teamName = $(this).text().substring(0, 3);
                                switch(teamName) {
                                    case 'Bro': teamName = 'BKN'; break;
                                    case 'Gol': teamName = 'GS'; break;
                                    case 'Los': 
                                        if (isClippers) {
                                            teamName = 'LAC';
                                            isClippers = false;
                                        }
                                        else {
                                            teamName = 'LAL';
                                        }
                                        break;
                                    case 'New': teamName = 'NY'; break;
                                    case 'Okl': teamName = 'OKC'; break;
                                    case 'San': teamName = 'SA'; break;
                                }
                                schedule[teamName] = {};
                                oNum++;
                            }
                            else {
                                if (this.text() != 'R:') {
                                    var game = this.parent().text();
                                    var mArr = game.split('\n');
                                    var mNum = mArr[1].substring(3);
                                    schedule[teamName][oNum] = parseFloat(mNum); 
                                }
                                oNum++;
                            } 
                        });
                    });
                    callback(teamNum);
                });
            }
        })(teamNum, callback));    
    }

	var getTeamSOS = function(x) {
		var currentTeam = teams[x];
        projections[x] = {
			'3PM': 0.0,
			'REB': 0.0,
			'AST': 0.0,
			'STL': 0.0,
			'BLK': 0.0,
			'TO': 0.0,
			'PTS': 0.0
		}
        
        //loop through players on team x
		for (var player in currentTeam) {
            var currentPlayer = currentTeam[player];
			if (currentPlayer[stats[0]] && currentPlayer[stats[4]] != '--') {
                var team = currentPlayer['Team'].trim();
                var playerSchedule = schedule[team];
                
                //loop through matchups in schedule
                for (var matchup in playerSchedule) {
                    var mRating = playerSchedule[matchup];
                    var scale = mRating * .05 + .725;
                    
                    var statLoopCounter = 0;
                    //loop through stats for each player
                    for (var stat in currentPlayer) {
                        if (statLoopCounter > 4) {
                            projections[x][stat] += parseFloat(currentPlayer[stat]) * scale;    
                        }
                        statLoopCounter++;
                    }       
                }
			}
		}
        console.log(projections);
        process.exit();
	}
}

exports.run = runServer;
