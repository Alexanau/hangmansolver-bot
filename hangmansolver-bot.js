var irc = require('irc');
var fs = require('fs');

var file = process.argv[2];

var config = {
channels: ["#osuosc-hangman-testing"],
	server: "irc.freenode.net",
	botName: "Anti-Hangman-Botman"
};

var bot = new irc.Client(config.server, config.botName, {
channels: config.channels
});

var game = {};
var completedWord = {}; 
var lettersLeft={};
var pattern = {};
var block = {};

for (var i = 0; i < config.channels.length; i++) {
	var channel = config.channels[i];
	game[channel] = false;
	lettersLeft[channel] = "abcdefghijklmnopqrstuvwxyz";
	pattern[channel] = " ";
	block[channel] = 0;
}

var enemy = 'Hangman-Botman1';

var makeGuess = function(channel,regExp){
	console.log("regexp: "+regExp.toString());
	fs.readFile(file, function(err, data) { 
		if (err) throw err;
		var lines = data.toString().split('\n');
		var chars = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0, k:0,
		l:0, m:0, n:0, o:0, p:0, q:0, r:0, s:0, t:0, u:0, v:0, w:0, x:0, y:0, z:0};
		for(var i = 0; i < lines.length; i++){
			if(regExp.test(lines[i].toLowerCase())){
				for(var k = 0;k<lines[i].length;k++){
					chars[lines[i].toLowerCase().charAt(k)] += 1;
				}
			}
		}
		var hiCount = 0;
		var bestChar = 'z';
		for(var i = 0; i<lettersLeft[channel].length;i++){
			if(chars[lettersLeft[channel].charAt(i)] > hiCount){
				bestChar = lettersLeft[channel].charAt(i);
				hiCount = chars[lettersLeft[channel].charAt(i)];
			}
		}
		bot.say(channel,".guess "+bestChar);
		lettersLeft[channel] = lettersLeft[channel].replace(new RegExp(bestChar,"gi"),'');
	});
};


/*meassage from users*/
bot.addListener("message", function(from, to, text, message) {
		if(text.toLowerCase().substring(0,14) == '.start hangman'){
			game[to] = true;
			lettersLeft[to] = "abcdefghijklmnopqrstuvwxyz";
			block[to] = 0;
		}
		if(game[to] && text.toLowerCase().substring(0,7) == '.guess') {
			var letter = test[7];
			lettersLeft[to] = lettersLeft.replace(new RegExp(letter,"gi"),'');
			block[to] = 0;
		}
		if(game[to]&&text.toLowerCase().substring(0,8)==".letters" || 
		text.toLowerCase().substring(0,14) == '.start hangman'){
			block[to] -= 1;
		}
});
/*meassage from enemy*/
bot.addListener("message", function(from, to, text, message) {
	if(message.nick == enemy){
		if((text.substring(0,9) == "You lose!"
		||text.substring(0,8) == "You win!")){
			game[to] == false;
		}
		
		if(game[to]&&text.replace(/ /g, '').length != 26){
			if(text.substring(0,36) == "This letter has already been guessed."){
				block[to] -= 1;
			}
			if( text[0] != '|'  && text[1] == ' ' ){
				pattern[to] = text.replace(/_/g,"["+lettersLeft[to]+"]").replace(/ /g,'');
				console.log("pattern: "+pattern[to]);
				makeGuess(to,new RegExp(pattern[to],"gi"));
				block[to] = 0;
			}else if(block[to] >= 5){
				makeGuess(to,new RegExp(pattern[to],"gi"));
			}
			block[to] += 1;
		}
	}
});
