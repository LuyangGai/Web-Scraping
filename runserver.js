var request = require('request');
var cheerio = require('cheerio');
var domain = require('domain');
var express = require('express');

var stats = ['FG', 'FG%', 'FT', 'FT%', '3PM', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PTS'];
var statsCounter = 0;
var testMax = 12;
var teams = {};
var calculateTotalRuns = 0;
var schedule = {};
var projections = {};

runServer = function() {
    app = module.exports = express();
    pub = __dirname;
    port = process.env.port || 1337;
    
    //SERVER METHOD
    app.configure(function () {
        //set path to the views
        app.set('views', pub + '/views');
        app.set('view engine', 'jade');
        app.set('view options', { layout: false });
    
        //create server
        app.use(app.router);
        app.use(express.methodOverride());
        app.use(express.static(__dirname + '/public'));
        app.use(express.errorHandler());
    });
    
    //listen on localhost:3000
    app.listen(port);
    
    //GET - TEAM STATS - PAGE
    app.get('/teams/:id', function (req, res) {
        res.render('allStats.jade', {'id': req.params.id});
    });
    
    //GET - TEAM STATS - DATA
    app.get('/getTeamStats/:id', function(req, res) {
        var callbackCounter = 0;
        if (!teams[1]) {
            for (var j = 1; j <= testMax; j++) {
                getESPNTeamData(j, function(x) {
                    callbackCounter++;
                    if (callbackCounter == 12) {
                        res.send(teams);
                    }
                });
            }  
        }
        else {
            res.send(teams);    
        }
    });
    
    //GET - ALL PROJECTIONS - PAGE
    app.get('/projections', function(req, res) {
        res.render('allProjections.jade');
    });
    
    //GET - ALL STATS - DATA
    app.get('/getProjections', function(req, res) { 
        //getRotoworldNews('Kemba','Walker');
        getAllStats(function() {
            calculateAllAverages();
            getESPNSchedule(function() {
                calculateAllTeamProjections();
                res.send(projections);
            });  
        });
    });
    
    app.get('/players/:id', function(req, res) {
        res.render('settings.jade');    
    });
    
    app.get('/getPlayers/:id', function(req, res) {
        
    });
    
    var getPlayerInfo = function(id) {
        
    }
    
    var getRotoworldNews = function(fName, lName) {
        var url = 'http://www.rotoworld.com/content/playersearch.aspx?searchname=' + lName + ',' + fName + '&sport=nba';
        request(url, function(err, resp, body) { 
            if (err)
                throw err;
            $ = cheerio.load(body);
            $('.playernews > .report').each(function() {
                console.log(this.text());
            });
            $('.playernews > .impact').each(function() {
                console.log(this.text());
            });
        });
        
    }

	var getAllStats = function(callback) {
		var callbackCounter = 0;
		for (var j = 1; j <= testMax; j++) {
			getESPNTeamData(j, function(x) {
				callbackCounter++;
				if (callbackCounter == 12) {
                    callback();
				}
			});
		}
	}
    
    //SERVER METHOD
	var getESPNTeamData = function(j, callback) {
		teams[j] = {};
        var url = 'http://games.espn.go.com/fba/clubhouse?leagueId=78232&teamId=' + j + '&seasonId=2014&view=stats&context=clubhouse&version=currSeason&ajaxPath=playertable/prebuilt/manageroster&managingIr=false&droppingPlayers=false&asLM=false';

        request(url, ( function(j) {
            return function(err, resp, body) {
                if (err)
                    throw err;
                $ = cheerio.load(body);
                var playerName = '';
				//var playerString = '';
                $('title').each(function() {
                    var tNArray = this.text().split('-');
                	teams[j]['Name'] = tNArray[0].trim();;
				});
                $('tr.pncPlayerRow').each(function() {
                   	$('tr.pncPlayerRow a[tab$="null"]', this).each(function() {
						playerName = $(this).text();
                        teams[j][playerName] = {};	
                        teams[j][playerName]['Name'] = playerName;
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

    var calculateAllAverages = function() {
        for (var team in teams) {
            calculateAverages(team);
        }
    }
    
	var calculateAverages = function(x) {
		var playerCount = 0;
		var currentTeam = teams[x];
        
		calculateTotalRuns++;
		
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

    var getESPNSchedule = function(callback) {
        //var url = 'http://espn.go.com/fantasy/basketball/story/_/id/9981540/fantasy-basketball-forecaster-nov-18-24-lineup-advice-quality-matchups';
        var url = 'http://espn.go.com/fantasy/basketball/story/_/id/10018987/fantasy-basketball-forecaster-nov-25-dec-1-lineup-advice-quality-matchups';
        request(url, function(err, resp, body) { 
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
            });
            callback();
        });    
    }

    var calculateAllTeamProjections = function() {
        for (var i = 1; i < 13; i++) {
            calculateTeamProjections(i);
        }
    }
    
	var calculateTeamProjections = function(x) {
		var currentTeam = teams[x];
        projections[x] = {};
        
        projections[x]['Name'] =  currentTeam['Name'];
        for(var i = 4; i < stats.length; i++) {
            projections[x][stats[i]] = 0.0;
        }
        
        //loop through players on currentTeam
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
                        statLoopCounter++;
                        if (statLoopCounter > 6)
                            projections[x][stat] += parseFloat(currentPlayer[stat]) * scale;    
                    }
                }
			}
		}
	}
}

exports.run = runServer;
