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
const readline = require('readline');
const {
    google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.settings.readonly'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

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
    textPlus: ':white_check_mark: The pomodoro count has been incremented. New value : %value%. :arrow_up:',
    textMinus: ':white_check_mark: The pomodoro count has been decremented. New value : %value%. :arrow_down:',
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

//Initialising Pomodoro variables
var pomRunning = false;
var breakRunning = false;
var timeLeft;
var timerID;
var intervalID;
var afkUsers = [];

//Initalising Calendar variables
var credentials;
var client_secret;
var client_id;
var redirect_uris;
var auth;
var calendar;

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    //authorize(JSON.parse(content), listEvents);
    credentials = JSON.parse(content);
    client_secret = credentials.installed.client_secret;
    client_id = credentials.installed.client_id;
    redirect_uris = credentials.installed.redirect_uris;
    auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(auth, callback);
        auth.setCredentials(JSON.parse(token));
        //callback(auth);
    });
    calendar = google.calendar({
        version: 'v3',
        auth
    });
});

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

            if (cmd === 'website' || cmd === 'w') {
                message.channel.send("https://knightsofacademia.com");
            }

            //Function to give clan list
            if (cmd === 'clans') {
                message.channel.send(":crossed_swords: **Here is our list of KOA Clans!** :crossed_swords:\n\n:small_orange_diamond: **The Round Table:** All things Hard Mode by Alex\n:small_orange_diamond: **Bards of Academia:** All things music by poss\n:small_orange_diamond: **The Fiction Faction:** Creative Writing & Story Telling by Blue Demon\n" +
                    ":small_orange_diamond: **The Wolf Pack:** Data Science & all things STEM by QueenWolf\n:small_orange_diamond: **The Gathering:** Accountability by nurse4truth\n:small_orange_diamond: **The Clockwork Knights:** Productivity & Efficiency through the use of Systems by VonKobra\n:small_orange_diamond: **The Silver Tongues:** Language & Culture by MI6\n:small_orange_diamond: **The Students:** Academics & all things Education by Eric");
            }

            if (cmd === 'events') {
                message.channel.send(":small_orange_diamond: **KOA EVENTS 2019** :small_orange_diamond:\n**January:** Fireside Chat\n**February:** Fireside Chat (TBA)\n**March:** Fireside Chat (TBA), Town Hall Meeting\n**April:** Fireside Chat (TBA)\n**May:** Fireside Chat (TBA)\n**June:** Fireside Chat (TBA), Town Hall Meeting\n" +
                    "**July:** Fireside Chat (TBA)\n**August:** Fireside Chat (TBA)\n**September:** Fireside Chat (TBA) Town Hall Meeting\n**October:** Fireside Chat (TBA)\n**November:** Fireside Chat (TBA)\n**December:** KOA Secret Santa, YearCompass, Fireside Chat (TBA), Town Hall Meeting");
            }

            if (cmd === 'opportunities') {
                message.channel.send("We're always looking for new applicants to the leadership teams here on KOA and over on KOAI, so here's an idea of what roles you can apply for:\n\n__**KOA Staff Roles**__\n" +
                    ":small_orange_diamond: **Guardian:** The moderation team of KOA, responsible for keeping things civilised, helping out the community and welcoming new users to the fold.\n:small_orange_diamond: **Architect:** The minds that build KOA. These guys are responsible for planning and building new features, listening to suggestions from the community and doing their best to implement them in accordance with KOA's vision.\n" +
                    ":small_orange_diamond: **Website Team:** The team that works on the Knights of Academia website. If you've got any experience writing, editing or working in website development, this is your place to be.\n:small_orange_diamond: **Website Manager:** The leaders of the website team, responsible for staying on top of all facets of the website, and helping to make it flourish.\n" +
                    ":small_orange_diamond: **Sector Leader:** The leader of one of the Sectors of KOA. They aim to bring more attention to the Sector, get people talking and share relevant material and ideas.\n:small_orange_diamond: **Club Leader:** The leader of KOA special-interest groups called 'Clubs'. They facilitate discussion and engage with the other club members.\n\n" +
                    "__**KOAI Staff Roles**__\n:small_orange_diamond: **Keeper:** The moderation team of KOAI. Take care of all the staff and administrative matters, and also make sure people follow the rules.\n:small_orange_diamond: **Scholar:** If you're familiar with a language, and wouldn't mind helping out other people with it, or translating into or out of it, this is the role for you. Scholars are also present in staff discussions and assist the Keepers.\n\n" +
                    "All roles can be applied for using the appropriate form in #community-forms, and any questions about anything should be directed to your nearest Guardian. Good luck to all applicants! :tada:");
            }
            //Function to give application form for clans
            if (cmd === 'apply') {
                if (!args[0]) {
                    message.channel.send("Please apply for a Clan with ``!apply <Clan Name>``.")
                }
                if (args[0] === 'theroundtable' || args[0] === 'trt' || args[0] === 'roundtable' || args[0] === 'hardmode' || args[0] === 'hard' || args[0] === 'round' || ((args[0] === 'the') && (args[1] === 'round') && (args[2] === 'table'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/m5onrVAaFc7RN1kg2");
                } else if (args[0] === 'thebards' || args[0] === 'bards' || args[0] === 'bardsofacademia' || ((args[0] === 'the') && (args[1] === 'bards'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/3csyULhB5aqCHjoB3");
                } else if (args[0] === 'thefictionfaction' || args[0] === 'ff' || args[0] === 'fictionfaction' || args[0] === 'fiction' || ((args[0] === 'the') && (args[1] === 'fiction') && (args[2] === 'faction'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://docs.google.com/document/d/1KAPSiUMTpg3a6lzWCAJuqSxrA9-zzldYn_f35DJ_xXw/edit?usp=sharing");
                } else if (args[0] === 'thewolfpack' || args[0] === 'wolfpack' || args[0] === 'twp' || ((args[0] === 'the') && (args[1] === 'wolf') && (args[2] === 'pack'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/QJDWzppdgGsniPWG2");
                } else if (args[0] === 'thegathering' || args[0] === 'gathering' || ((args[0] === 'the') && (args[1] === 'gathering'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/69tZ0ovv6Asd32zg2");
                } else if (args[0] === 'theclockworkknights' || args[0] === 'clockwork' || args[0] === 'clockwork knights' || ((args[0] === 'the') && (args[1] === 'clockwork') && (args[2] === 'knights'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/5klpWjPVeCkRfdWF2");
                } else if (args[0] === 'thesilvertongues' || args[0] === 'silvertongues' || args[0] === 'silver' || args[0] === 'tongues' || ((args[0] === 'the') && (args[1] === 'silver') && (args[2] === 'tongues'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/GcPz3zG8kmh3ZJBw1");
                } else if (args[0] === 'thestudents' || args[0] === 'students' || args[0] === 'study' || args[0] === 'studentsofkoa' || ((args[0] === 'the') && (args[1] === 'students'))) {
                    message.channel.send(":heavy_check_mark: **Fill out your user ID to receive an invite!**\n\n`Average Response Time - 24 hours or less`\n\nhttps://goo.gl/forms/mwHlk2Kj3kfC9Bfw1");
                }
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
                } else if (args[0] === 'cephil') {
                    fs.readFile('./txt/cephil.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'poss') {
                    fs.readFile('./txt/poss.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'alex') {
                    fs.readFile('./txt/alex.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'pomodoro' || args[0] === 'pom') {
                    fs.readFile('./txt/pom.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'kyr\'amlaar' || args[0] === 'kyram' || args[0] === 'kyramlaar') {
                    fs.readFile('./txt/kyram.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'spaghetz') {
                    fs.readFile('./txt/spaghetz.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'cassius') {
                    fs.readFile('./txt/cassius.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'elske') {
                    fs.readFile('./txt/elske.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'ange') {
                    fs.readFile('./txt/ange.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'rex') {
                    fs.readFile('./txt/rex.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'citadel') {
                    fs.readFile('./txt/citadel.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'eric') {
                    fs.readFile('./txt/eric.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'austin') {
                    fs.readFile('./txt/austin.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'fireside' || args[0] === 'firesidechat') {
                    fs.readFile('./txt/fireside.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'xp') {
                    fs.readFile('./txt/xp.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === '30pomdream') {
                    fs.readFile('./txt/30pomdream.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'voting') {
                    fs.readFile('./txt/voting.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'ash') {
                    fs.readFile('./txt/ash.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'rebel') {
                    fs.readFile('./txt/rebel.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'rotmg') {
                    fs.readFile('./txt/rotmg.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'opportunities') {
                    fs.readFile('./txt/opportunities.txt', 'utf8', function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        message.channel.send(data);
                    });
                } else if (args[0] === 'events') {
                    fs.readFile('./txt/events.txt', 'utf8', function(err, data) {
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
                    case '30pomdream':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/30pomdream.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'alex':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/alex.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'ange':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/ange.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'ash':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/ash.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'austin':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/austin.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'cassius':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/cassius.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'cephil':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/cephil.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'citadel':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/citadel.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'elske':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/elske.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'eric':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/eric.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'events':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/events.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'fireside':
                    case 'firesidechat':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/fireside.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'kyram':
                    case 'kyr\'amlaar':
                    case 'kyramlaar':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/kyramlaar.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'opportunities':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/opportunities.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'pom':
                    case 'pomodoro':
                    case 'poms':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/pom.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'poss':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/poss.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'rebel':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/rebel.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'rex':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/rex.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'rotmg':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/rotmg.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'spaghetz':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/spaghetz.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'voting':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/voting.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
                            // throws an error, you could also catch it here
                            if (err) throw err;
                            // success case, the file was saved
                            console.log('Text saved!');
                        });
                        break;
                    case 'xp':
                        var tempArgs = args;
                        message.channel.send(args[1] + " successfully edited!");
                        tempArgs.splice(0, 2);
                        fs.writeFile('./txt/xp.txt', tempArgs.toString().replace(/,/g, " "), (err) => {
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
                if (afkUsers.includes(message.member.username)) {
                    afkUsers.splice(indexOf(message.member.username), 0);
                } else {
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
        }; client.login(token);

        function isStaff(member) {
            if (member.roles.find("name", "Guardians")) {
                return true;
            } else if (member.roles.find("name", "Architects")) {
                return true;
            } else if (member.id === '183699552262422529') {
                return true;
            }

            //get Alex's ID probably
            return false;
        }

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
                message.channel.send(":x: **Error:** Something isn't right.");
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

        /**
         * Create an OAuth2 client with the given credentials, and then execute the
         * given callback function.
         * @param {Object} credentials The authorization client credentials.
         * @param {function} callback The callback to call with the authorized client.
         */
        function authorize(credentials, callback) {
            const {
                client_secret,
                client_id,
                redirect_uris
            } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
        }

        /**
         * Get and store new token after prompting for user authorization, and then
         * execute the given callback with the authorized OAuth2 client.
         * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
         * @param {getEventsCallback} callback The callback for the authorized client.
         */
        function getAccessToken(oAuth2Client, callback) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return console.error('Error retrieving access token', err);
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) console.error(err);
                        console.log('Token stored to', TOKEN_PATH);
                    });
                    callback(oAuth2Client);
                });
            });
        }

        /**
         * Lists the next 10 events on the user's primary calendar.
         * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
         */
        function listEvents(auth) {
            const calendar = google.calendar({
                version: 'v3',
                auth
            });
            calendar.events.list({
                calendarId: 'knightsofacademia@gmail.com',
                timeMin: (new Date()).toISOString(),
                maxResults: 20,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    console.log('Upcoming 10 events:');
                    events.map((event, i) => {
                        const start = event.start.dateTime || event.start.date;
                        console.log(`${start} - ${event.summary}`);
                    });
                } else {
                    console.log('No upcoming events found.');
                }
            });
        }