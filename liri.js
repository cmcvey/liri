var inquirer = require('inquirer')
var fs = require('fs')
var Twitter = require('twitter')
var keys = require('./keys')
var Spotify = require('node-spotify-api')
var request = require('request')

inquirer
  .prompt([
    {
	     type: "list",
	     message: "What type of data would you like?",
	     choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
	     name: "command"
    },
    {
		type: "string",
		message: "What song?",
		when: function(answers) {
			return answers.command === "spotify-this-song"
		},
		name: "value"
    },
    {
		type: "string",
		message: "What movie?",
		when: function(answers) {
			return answers.command === "movie-this"
		},
		name: "value"
    }
    ])
  .then(handleResponse)
  .catch(function(err) {
  	console.log(err)
  })

  function handleResponse(answers) {
  	var output = ''

  	switch (answers.command) {
		case 'my-tweets':
			var client = new Twitter(keys)
			var params = {screen_name: 'caryn_mcvey'};

			client.get('statuses/user_timeline', params, function(error, tweets, response) {
			  if (!error) {
			  	output += tweets.map(function(tweet) {
			    	return tweet.text;
			    }).join('\n');
			    writeFile(output);
			  } else {
			  	console.log(error);
			  }
			})
			break;

		case 'spotify-this-song':
			var spotify = new Spotify({
				id: '397426aceb374de99a160054a3635bd4',
				secret: '79d8d1a931e54d2f898809642649b9b7'
			});

			spotify.search({ type: 'track', query: answers.value || 'The Sign Ace of Base' }, function(err, data) {
				if (err) {
	    			return console.log('Error occurred: ' + err);
	  			}
	  			output += data.tracks.items[0].name + '\n';
				output += data.tracks.items[0].artists.map(function(artist) {
					return artist.name
				}).join(',') + '\n';
				output += data.tracks.items[0].href + '\n';
				output += data.tracks.items[0].album.name + '\n';
				writeFile(output); 
			});
			break;

		case 'movie-this':
			request("http://www.omdbapi.com/?t=" + (answers.value || 'Mr. Nobody') + "&apikey=trilogy", function(error, response, body) {
				if (!error && response.statusCode === 200) {
					var data = JSON.parse(body);
					output += data.Title + '\n';
					output += data.Year + '\n';	
		    		output += data.imdbRating + '\n';
		    		output += data.Ratings.find(function(item) {
		    			return item.Source === 'Rotten Tomatoes'
		    		}).Value + '\n'
		    		output += data.Country + '\n';
		    		output += data.Language + '\n';
		    		output += data.Plot + '\n';
		    		output += data.Actors + '\n';
		    		writeFile(output);
	  			}
			});
			break;

		case 'do-what-it-says':
			return fs.readFile('./random.txt', 'utf8', function(err, data) {
				if (err) {
					console.log(err)
				} else {
					var [command, value] = data.split(',');
					handleResponse({command, value});
					writeFile(output);
				}		 	
			});
			break;
	}
}

	function writeFile(output) {
		fs.appendFile('log.txt', output, (err) => {
  		if (err) throw err;
  		console.log(output)
		})
  	}