// to read the settings file
var PropertiesReader = require('properties-reader');
// to interact with Discord
const Discord = require('discord.js');
//To be able to write to files
var fs = require("fs");
//To do math evaluations
var math = require("mathjs");
//Initialising properties
var properties = PropertiesReader('settings.properties');
//Initalising the bot
const client = new Discord.Client();
//Setting up bot token
const token = properties.get('token');
//Initalising ownerID
var ownerID = properties.get('ownerID');
//Initalising command prefix
var prefix = properties.get('prefix');
// the regex we will use to check if the name is valid
var inputFilter = /^[A-Za-z0-9]+$/;
// the regex we will use to replace user mentions in message
var mentionFilter = /\s(<?@\S+)/g;

// this is a counter prototype
// we do not directly use it in the code as the references in javascript are weird
var dummy = {
	owner: '0',
	value: 0,
	step: 1,
	name: 'dummy',
	textView: 'Value of %name% : %value%',
	textPlus: ':white_check_mark: The pomodoro count has been incremented. New value : %value%.',
	textMinus: ':white_check_mark: The pomodoro count has been decremented. New value : %value%.',
	textReset: 'The value of %name% has been reset to %value%.',
	textValue: 'The value of %name% has been set to %value%.',
	textLeaderboard: 'Pomodoro Challenge Leaderboard :',
	leaderboard: {},
	whitelist: {}
};
var userLeaderboardDummy = {
	id: '0',
	username: 'dummy',
	value: 0
};

//Initialising counter file
var counters = require('./counters.json');

//Initialising pomodoro variables
var pomRunning = false;
var breakRunning = false;
var timeLeft;
var timerID;
var intervalID;
var afkUsers = [];

client.on('ready', () => {
	//Start-up Message
	console.log(' -- READY TO RUMBLE -- ');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || !message.content.length > 1 || message.author.bot) {
		return;
	}
	//slice off the prefix from the input, and then separate out the arguments
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	/*
	OLD COMMAND HANDLER
	message.args = message.args.substring(prefix.length); // removes the prefix
	message.args = message.args.replace(mentionFilter, ""); // TODO change the way this work to be able to handle roles aswell
	var args = message.args.split(" ");
	*/
	function isOwner() {
		return message.author.id == ownerID;
	}
	//!raid, the link to provide a link to the Cuckoo Timer
	if (cmd === 'raid' || cmd === 'r') {
		message.channel.send("https://cuckoo.team/koa");
	}
	//!info, the KOA Glossary
	if (cmd === 'info' || cmd === 'i') {
		if (args[0]) {
			args[0] = args[0].toLowerCase();
		}
		if (args[0] === 'raid' || args[0] === 'raids') {
			fs.readFile('./txt/raid.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'habitica' || args[0] === 'habitca') {
			fs.readFile('./txt/habitica.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'clan' || args[0] === 'clans') {
			fs.readFile('./txt/clan.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'guardian' || args[0] === 'guardians') {
			fs.readFile('./txt/guardian.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'diva') {
			fs.readFile('./txt/diva.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'botm') {
			fs.readFile('./txt/botm.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'cotw') {
			fs.readFile('./txt/cotw.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === '10kdream') {
			fs.readFile('./txt/10kdream.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'ojas') {
			fs.readFile('./txt/ojas.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'sector' || args[0] === 'sectors') {
			fs.readFile('./txt/sector.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'habitashia') {
			fs.readFile('./txt/habitashia.txt', 'utf8', function(err, data) {
				if (err) {
					return console.log(err);
				}
				message.channel.send(data);
			});
		} else if (args[0] === 'edit') switch (args[1]) {
			case 'raid':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/raid.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'habitica':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/habitica.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'clan':
			case 'clans':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/clan.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'guardian':
			case 'guardians':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/guardian.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'diva':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/diva.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'botm':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/botm.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case '10kdream':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/10kdream.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'ojas':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/ojas.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'sector':
			case 'sectors':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/sector.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
			case 'habitashia':
				var tempArgs = args;
				message.channel.send(args[1] + " successfully edited!");
				tempArgs.splice(0, 2);
				fs.writeFile('./txt/habitashia.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;
					// success case, the file was saved
					console.log('Text saved!');
				});
				break;
		}
    }
    
    //-----Pomodoro commands-----
	//!pom/!p, to start a pomodoro session
	if (cmd === 'p') {
		if (pomRunning) {
			message.channel.send(':x: There is already an active pomodoro!');
			return;
		} else if (breakRunning) {
			message.channel.send(':x: The break is still going!');
			return;
		}
		if (cmd === 'p' && !args[0]) {
			timer(25, 'pom', message)
		} else if (Number.isInteger(parseInt(args[0]))) {
			timer(parseInt(args[0]), 'pom', message);
		} else {
			message.channel.send(':x: Error: use ``!pom X`` to start a pomodoro for X minutes.');
		}
    }
    
	//!break/!b, to start a break after a pom session
	if (cmd === 'break' || cmd === 'b') {
		if (pomRunning) {
			message.channel.send(':x: The pomodoro is still going!');
			return;
		} else if (breakRunning) {
			message.channel.send(':x: There is already an active break!');
			return;
		}
		if (cmd === 'b' && !args[0]) {
			timer(5, 'break', message)
		} else if (Number.isInteger(parseInt(args[0]))) {
			timer(parseInt(args[0]), 'break', message);
		} else {
			message.channel.send(':x: Error: use ``!break X`` to start a break for X minutes.');
		}
	}
	//!stop/!s, to stop a pomodoro session or a break
	if (cmd === 'stop' || cmd === 's') {
		if (pomRunning) {
			clearTimeout(timerID);
			message.channel.send(':white_check_mark: **Successfully stopped the pomodoro.**');
			pomRunning = false;
		} else if (breakRunning) {
			clearTimeout(timerID);
			message.channel.send(':white_check_mark: **Successfully stopped the break.**');
			breakRunning = false;
		} else {
			message.channel.send(':x: There is nothing active to stop right now.');
		}
	}
	//!time/!t, to see how much time is left in the work session or the break
	if (cmd === 'time' || cmd === 't') {
		if (!pomRunning && !breakRunning) {
			message.channel.send(':x: There is no active session right now.');
			return;
		}
		var mins = Math.floor(Math.round(timeLeft / 1000) / 60);
		var secs = (Math.round(timeLeft / 1000)) - (mins * 60);
		if (secs < 10) {
			secs = '0' + secs;
		}
		if (pomRunning) {
			//message.channel.send("Time left in milliseconds: " + timeLeft);
			message.channel.send(`:timer: There are currently __**${mins}:${secs}**__ minutes left in the work session. :timer:`);
		}
		if (breakRunning) {
			message.channel.send(`:timer: There are currently __**${mins}:${secs}**__ minutes left in the break. :timer:`);
		}
	}
	//!coinflip, to give you a 50/50 option when you gotta make a tough call
	if (cmd === 'coinflip' || cmd === 'flipcoin') {
		if (Math.random() < 0.5) {
			message.channel.send(message.author + " flipped...\n\n**HEADS!**");
		} else {
			message.channel.send(message.author + " flipped...\n\n**TAILS!**");
		}
    }
    
	//!8ball, ask a yes/no question
	if (cmd === '8ball') {
		var responses = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."];
		var response = responses[Math.floor((Math.random() * 20) + 1)];
		message.channel.send(response);
    }

	//AFK command
	if (cmd === 'afk') {
        //adds/removes AFK
        if(afkUsers.includes(message.member.username)){
            afkUsers.splice(indexOf(message.member.username), 0);
        } else{
            var afkMessage = args.toString().replace(/,/g, " ")
            message.member.setNickname("AFK: " + message.member.nickname);
            afkUsers.push(message.member.username);
		    message.channel.send("AFK set to: " + afkMessage);
        }
    }
    
    //check for messages that mention AFK users
    /*if(message.includes(mention)){
        message.channel.send("User is AFK: " + afkMessage);
    }*/

	//----------------------------------------------------------------
	//            POM-COUNTER/LEADERBOARD COMMANDS
	//----------------------------------------------------------------
	if (cmd === 'addcounter' || cmd === 'ac') {
		if (args.length == 1) {
			if (!message.member.roles.find("name", "Guardians")) {
				message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
				return;
			}
			var state = addCounter(message.author.id, args[0]);
			if (state == 1) {
				message.channel.send(':white_check_mark: The counter has been correctly added.');
			} else if (state == 2) {
				message.channel.send(':x: **Error:** A counter with this name already exists, please choose another one.');
			} else if (state == 3) {
				message.channel.send(':x: **Error:** Your counter name contains illegal characters. Please match /^[A-Za-z0-9]+$/.');
			}
		}
	} else if (cmd === 'delcounter' || cmd === 'dc') {
		if (!message.member.roles.find("name", "Guardians")) {
			message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
			return;
		}
		if (args.length == 1) {
			var state = delCounter(message.author.id, args[0]);
			if (state == 1) {
				message.channel.send(':white_check_mark: The counter has been correctly deleted.');
			} else if (state == 2) {
				message.channel.send('There is no counter with this name.');
			} else if (state == 3) {
				message.channel.send('You are not the owner of this counter.');
			}
		}
	} else if (cmd === 'log') {
		console.log(counters);
	} else if (cmd === "cleardb") {
		if (isOwner()) {
			counters = {};
			message.channel.send('Local database has been cleared.');
			saveToDisk();
		} else {
			message.channel.send('Sorry, only the owner can do this.');
		}
	} else if (cmd === 'exit') {
		if (isOwner()) {
			message.channel.send('Stopping').then(x => {
				client.destroy();
				process.exit(0);
			});
		} else {
			message.channel.send('Sorry, only the owner can do this.');
		}
	} else if (cmd === "upgradecounters") {
		if (isOwner()) {
			upgradeCounters();
			message.channel.send('Counters have been upgraded. You MUST restart the bot, or weird behaviour could happen.');
			saveToDisk();
		} else {
			message.channel.send('Sorry, only the owner can do this.');
		}
	} else if (cmd === "uid") {
		message.channel.send('Your UID is : ' + message.author.id);
	} else if (cmd === ("listcounters")) {
		var output = '```\r\n';
		for (var key in counters) {
			output += counters[key].name + '\r\n';
		}
		output += '```';
		message.channel.send(output);
	} else {
		var counterName = cmd;
		if (counters[counterName]) {
			if (args.length == 0) {
				message.channel.send(getTextView(counterName));
			} else {
				if (args[0].startsWith('+')) {
					if (!message.mentions.members.first() && !message.member.roles.find("name", "Guardians")) {
						message.channel.send(":x: **Error:** Please make sure you tag yourself properly after the +. e.g. ``!pom + @Alex#8758``");
						return;
					}
					if (message.mentions.users.first() !== message.author && !message.member.roles.find("name", "Guardians")) {
						message.channel.send(":x: **Error:** Please only add to your own count.");
						return;
					}
					var length = args[0].length;
					if (length > 1 && !message.member.roles.find("name", "Guardians")) {
						message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
						return;
					}
					if (setValue(counterName, length == 1 ? "1" : message.content.substring(cmd.length + 3, cmd.length + 2 + length), '+', message.mentions.users)) {
						message.channel.send(getTextPlus(counterName));
					} else {
						message.channel.send("There was an error parsing your input.");
					}
				} else if (args[0].startsWith('-')) {
					if (!message.member.roles.find("name", "Guardians")) {
						message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
						return;
					}
					var length = args[0].length;
					if (setValue(counterName, length == 1 ? "1" : message.content.substring(cmd.length + 3, cmd.length + 2 + length), '-', message.mentions.users)) {
						message.channel.send(getTextMinus(counterName));
					} else {
						message.channel.send("There was an error parsing your input.");
					}
				} else if (args[0] == 'reset') {
					if (!message.member.roles.find("name", "Guardians")) {
						message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
						return;
					}
					resetValue(counterName);
					message.channel.send(getTextReset(counterName));
				} else if (args[0] == 'value') {
					if (args[1]) {
						if (setValue(counterName, message.content.substring(cmd.length + 1 + args[0].length + 1), '=')) {
							message.channel.send(getTextValue(counterName));
						} else {
							message.channel.send("There was an error parsing your input.");
						}
					}
				} else if (args[0] == 'edit') {
					if (counters[counterName][args[2]]) {
						var newValue = message.args.substr(message.content.indexOf(args[1]) + args[1].length + 1);
						setCounterText(counterName, args[1], newValue);
						message.channel.send('Property ' + args[1] + ' has been changed.');
					}
				} else if (args[0] == 'show') {
					if (counters[counterName][args[1]]) {
						message.channel.send(args[1] + ' : ' + counters[counterName][args[1]]);
					}
				} else if (args[0] == 'leaderboard') {
					var sortable = [];
					for (var key in counters[counterName].leaderboard) {
						sortable.push(counters[counterName].leaderboard[key]);
					}
					sortable.sort(function(a, b) {
						return b.value - a.value;
					});
					var output = '```\r\n';
					output += getTextLeaderboard(counterName) + '\r\n\r\n';
					for (var i = 0; i < sortable.length; i++) {
						output += (i + 1) + '. ' + sortable[i].username + ' : ' + sortable[i].value + '\r\n';
					}
					output += '```';
					message.channel.send(output);
				} else if (args[0] == 'clearleaderboard') {
					if (isOwner()) {
						counters[counterName].leaderboard = {};
						message.channel.send('Leaderboard for ' + counterName + ' has been cleared.');
						saveToDisk();
					} else {
						message.channel.send('Sorry, only the owner can do this.');
					}
				}
				saveToDisk();
			}
		}
	}
});
client.login(token);

function addCounter(id, title) {
	if (inputFilter.test(title) && title != "addcounter" && title != "delcounter" && title != "ac" && title != "dc") {
		if (counters[title]) {
			return 2;
		} else {
			counters[title] = JSON.parse(JSON.stringify(dummy));
			counters[title].owner = id;
			counters[title].name = title;
			saveToDisk();
			return 1;
		}
	} else {
		return 3;
	}
}

function getTextView(title) {
	return counters[title].textView.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextPlus(title) {
	return counters[title].textPlus.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextMinus(title) {
	return counters[title].textMinus.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextReset(title) {
	return counters[title].textReset.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextValue(title) {
	return counters[title].textValue.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextLeaderboard(title) {
	return counters[title].textLeaderboard.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function setCounterText(title, textToChange, newText) {
	counters[title][textToChange] = newText;
}

function resetValue(title) {
	setValue(title, dummy.value, '=', []);
}
//
function setValue(title, value, operator, mentions) {
	try {
		var val = math.eval(value);
		// ensure that each mentionned user is present in the leaderboard, creating them when needed
		mentions.forEach(function(value2) {
			if (!counters[title].leaderboard[value2.id]) {
				counters[title].leaderboard[value2.id] = {
					id: value2.id,
					username: value2.username,
					value: 0
				};
			}
		});
		switch (operator) {
			case '+':
				counters[title].value += val;
				mentions.forEach(function(value) {
					counters[title].leaderboard[value.id].value += val;
				});
				break;
			case '-':
				counters[title].value -= val;
				mentions.forEach(function(value) {
					counters[title].leaderboard[value.id].value -= val;
				});
				break;
			case '=':
				counters[title].value = val;
				mentions.forEach(function(value) {
					counters[title].leaderboard[value.id].value = val;
				});
				break;
		}
		return true;
	} catch (err) {
		return false;
	}
}

function getValue(title) {
	// since the value can be invalide due to the edit command, we check that it is an integer and reset it when needed
	var val = parseInt(counters[title].value);
	if (isNaN(val)) {
		counters[title].value = val = 0;
	}
	return val;
}

function getStep(title) {
	// since the value of step can be invalide due to the edit command, we check that it is an integer and reset it when needed
	var val = parseInt(counters[title].step);
	if (isNaN(val)) {
		counters[title].step = val = 1;
	}
	return val;
}

function delCounter(id, title) {
	if (inputFilter.test(title)) {
		if (counters[title]) {
			if (id != counters[title].owner && id != ownerID) {
				return 3;
			} else {
				delete counters[title];
				return 1;
			}
		} else {
			return 2;
		}
	} else {
		return 2;
	}
}

function saveToDisk() {
	fs.writeFile('counters.json', JSON.stringify(counters), "utf8", err => {
		if (err) throw err;
		console.log('Counters successfully saved !');
	});
}
// this function take the existing counters and upgrade them to the newest counter prototype
function upgradeCounters() {
	for (var key in counters) {
		if (!counters.hasOwnProperty(key)) continue;
		for (var key2 in dummy) {
			if (!dummy.hasOwnProperty(key2)) continue;
			if (!counters[key][key2]) {
				counters[key][key2] = dummy[key2];
			}
		}
	}
}
//Timer function for the pom-bot
function timer(time, session, message) {
	//Multiply by 60 and 1000 to turn it from minutes to milliseconds
	timeLeft = time * 60 * 1000;
	if (session === 'pom') {
		pomRunning = true;
		message.channel.send(`:tomato: **${time} minute pomodoro started!** :tomato:`);
		//setInterval(debug, 5000);
		timerID = setTimeout(endPom, time * 60 * 1000);
		intervalID = setInterval(countdown, 1000);
	} else if (session === 'break') {
		breakRunning = true;
		message.channel.send(`:couch: **${time} minute break started!** :couch:`);
		timerID = setTimeout(endBreak, time * 60 * 1000);
		intervalID = setInterval(countdown, 1000);
	} else {
		message.channel.send(":x: Something isn't right.");
	}

	function endPom() {
		message.channel.send(`:tada: **${time} minute pomodoro finished!** :tada:`);
		pomRunning = false;
	}

	function endBreak() {
		message.channel.send(`:tada: **${time} minute break finished!** :tada:`);
		breakRunning = false;
	}

	function countdown() {
		//Lower timeLeft by 1 second/1000 milliseconds every second
		timeLeft = timeLeft - 1000;
	}
}