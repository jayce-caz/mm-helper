chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		$('body').append('<a id="helper-toggle" href="JavaScript:void(0);">Players</a>');
		$('body').append('<div id="helper-bar"><div id="helper-players"></div></div>');

		
		helperStart();

		function helperStart(){
			
			//Toggle helper
			$('#helper-toggle').click(function(){
				$('#helper-bar').toggleClass('active');
			});

			createPlayerSection();
		}

		function getPlayers(){
			var playerIds = [];
			$.ajax({
			     url: "https://www.mobamanager.gg/players/yours",
			     dataType: 'text',
			     async: false,
			     success: function(data) {
			          	$(data).find(".players--player").each(function(){
			          	playerId = $(this).attr('data-id');
						playerIds.push(playerId);
					});
			     }
			});
			return playerIds;
		}
		
		function getPlayerStats(playerId){
			var playerStats = [];
			var energyOut = 0;
			var energyIn = 15; //Players have base regen of 15
			
			//Get Data from player page
			$.ajax({
		     url: "https://www.mobamanager.gg/players/show/"+playerId,
		     dataType: 'text',
		     async: false,
		     success: function(data) {
		     		//Get Name
		     		var playerName = $(data).find('.player--name .player--item .player--item-data').html();
		     		playerStats.push({label: "Name", value: playerName});

		     		//Get Stats
		        	$(data).find('.player--stats-item').each(function(){
		          		var statLabel = $(this).find('span').html();
		          		var statValue = $(this).find('.player--stats-data').html();
		          		var pair = {label:statLabel, value:statValue};
		          		playerStats.push(pair);
		          	});

		        	//Calculate SoloQ and Streaming Energy Loss
		        	var soloQ = parseInt($(data).find('select[name="soloq"] option[selected=""]').html());
		        	var stream = parseInt($(data).find('select[name="streaming"] option[selected=""]').html());
		        	energyOut += soloQ + stream;

		          	//Get Current Energy
		          	var currentEnergy = $(data).find('.player--energy div').html();
		          	playerStats.push({label:'Energy', value:currentEnergy});
		     	}
			});

			//Get data from training page
			$.ajax({
		     url: "https://www.mobamanager.gg/players/training/",
		     dataType: 'text',
		     async: false,
		     success: function(data) {
		     		//Unfortunately this is the best way to grab this data right now
		     		training = 0;
		     		$('input[name$='+playerId+']').each(function(){
		     			training += parseInt($(this).val());
		     		});
		     		energyOut += training;
		     	}
			});

			playerStats.push({label:"Energy Out",value:energyOut});

			return playerStats;
		}

		function createPlayerSection(){
			playerIds = getPlayers();
			var players = [];

			for(var i = 0; i < playerIds.length; i++){
				players.push(getPlayerStats(playerIds[i]));
			}

			//Create player table
			var html = '';

			for(var i = 0; i < players.length; i++){
				
				//Create table headers
				if(i == 0){
					currPlayer = players[i];
					html +='<tr>';
					
					for(var j = 0; j < currPlayer.length; j++){
						html += '<th>' + currPlayer[j].label + '</th>';
					}
					html += '</tr>';
				}

				//Create each player stat row
				currPlayer = players[i];
				html += '<tr>';
				
				for(var j = 0; j < currPlayer.length; j++){
					html += '<td>' + currPlayer[j].value + '</td>';
				}

				html += '</tr>';
			}
			$('#helper-players').append('<table id="helper-player-table">' + html + '</table>');
		}
		// ----------------------------------------------------------

	}
	}, 10);
});
