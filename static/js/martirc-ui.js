/**
 * Main ui constructor
 *
 * @contructor
 *
 */
MartIrcUi = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.ircClient = new MartIrcClient();

    self.init();
};


/**
 * MartIrcUi init
 *
 */
MartIrcUi.prototype.init = function() {
    var self = this;

    $('#connectButton').click(function() {

				  self.ircClient.connect(
				      $('#nodeServerHost').val(),parseInt($('#nodeServerPort').val())
				      , $('#ircServerHost').val(),parseInt($('#ircServerPort').val())
				      , $('#nickname').val()
				  );
			      });

    $('#prompt form').submit(function(event){
				 event.preventDefault();

				 self.sendMessage();
			     });

    $('#chat .current-title img').live('click', function(event){
					   self.removeChat();
				       });

    $('#channels div a.channel').live('click', function(event){
					  self.focusOnPublicChat($(this));
				      });

    $('#channels div a.user, #users .list.active a').live('click', function(event){
							      self.focusOnPrivateChat($(this));
							  });

    $('#channels div a.server').live('click', function(event){
					self.focusOnServer($(this)); 
				     });

    $(self.ircClient).bind('irc.server',function(event, data) { 
    			       self.displayServerMessage(data.raw);
    			   });

    $('#prompt form input').focus();
};

MartIrcUi.prototype.displayServerMessage = function(rawMsg) {
    var self = this;

    //console.log('Notice: ' + message);

    var msg = $('<span>').addClass('msg');
    msg.append($('<span>').addClass('server-msg').text('Server : '));
    msg.append($('<span>').addClass('txt').text(rawMsg));

    $("#chat .server").append(msg);

    self.focusOnPrompt();
};

MartIrcUi.prototype.scanMessage = function(rawMsg) {
    var self = this;

    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return rawMsg.replace(regex," <a href=\"$&\" target=\"_blank\">$&</a> ");
};


/*
 * Sending raw messages only for the moment
 */
MartIrcUi.prototype.sendMessage = function() {
    var self = this;

    var rawMsg = $('#prompt form input').val();

    $('#prompt form input').val('');

    var msg = $('<span>').addClass('msg');

    if($('#chat .active').hasClass('server')) {
	msg.append($('<span>').addClass("command").text('Command : '));
	msg.append($('<span>').addClass('txt').text(rawMsg));
	self.ircClient.sendRawMessage(rawMsg);
    } else {
	msg.append($('<span>').addClass("current-user nick").text($('#nickname').val()+' : '));
	msg.append($('<span>').addClass('txt').text(self.scanMessage(rawMsg)));
    }

    $('#chat .active').append(msg);

    self.focusOnPrompt();
};

MartIrcUi.prototype.focusOnPrompt = function() {
    var self = this;

    $("#chat .active").attr({ scrollTop: $("#chat .active").attr("scrollHeight") });

    $('#prompt form input').focus();
};

MartIrcUi.prototype.focusOnServer = function(channel) {
    var self = this;

    self.changeActiveChat(channel.attr('id'), 'Server');

    self.displayUsersTab(false);
    self.displayCloseIcon(false);

    var chatToEnable = $('#chat .server').addClass('active');
    chatToEnable.show();

    self.focusOnPrompt();
};

MartIrcUi.prototype.focusOnPrivateChat = function(channel) {
    var self = this;
    var id;

    if(channel.attr('id')){
	id = channel.attr('id');
    } else {
	id = channel.attr('class');
    }

    self.changeActiveChat(id, 'Private : '+channel.text());

    self.displayUsersTab(false);
    self.displayCloseIcon(true);

    if(!$('#channels div a#'+id).get(0)){
	var user = $('<a>').attr('id', id).attr('class', 'user').text(channel.text());
	$('#channels div').append(user);

	var userChat = $('<div>').attr('class', id);
	$('#chat').append(userChat);
    }

    var chatTitle = 'Private : '+channel.text();

    var chatToEnable = $('#chat .'+id).addClass('active');
    chatToEnable.show();

    self.focusOnPrompt();
};

MartIrcUi.prototype.focusOnPublicChat = function(channel) {
    var self = this;
    var id = channel.attr('id');

    self.changeActiveChat(id, 'Public : '+channel.text());

    self.displayUsersTab(true);
    self.displayCloseIcon(true);

    var chatTitle = 'Public : '+channel.text();

    var chatAndUsersToEnable = $('#chat .'+id+', #users .list.'+id).addClass('active');
    chatAndUsersToEnable.show();

    self.focusOnPrompt();
};

MartIrcUi.prototype.changeActiveChat = function(id, chatTitle) {
    var self = this;

    var channelToDisable = $('#channels .active');
    var chatAndUsersToDisable = $('#chat .active, #users .list.active');
    
    chatAndUsersToDisable.hide();
    channelToDisable.removeClass('active');
    chatAndUsersToDisable.removeClass('active');

    $("#chat .current-title span").text(chatTitle);

    $('#'+id).addClass('active');
};

MartIrcUi.prototype.removeChat = function() {
    var self = this;

    var id = $('#channels .active').attr('id');

    $('#channels  #'+id+', #chat .'+id).remove();

    if($('#channels .active').hasClass('channel')){
	$('#users .'+id).remove();
    }

    var lastChannel = $('#channels div a').last();

    if(lastChannel.attr('class') == 'channel') {
	self.focusOnPublicChat(lastChannel);
    } else if(lastChannel.attr('class') == 'user') {
	self.focusOnPrivateChat(lastChannel);
    } else {
	self.focusOnServer();
    }
};

MartIrcUi.prototype.displayUsersTab = function(display) {
    var self = this;

    if(display){
	$('#chat, #prompt').removeClass('span-19');
	$('#chat, #prompt').addClass('span-16');
	$('#prompt').removeClass('append-1');
	$('#prompt').addClass('append-4');
	$('#prompt .text').addClass('span-14');
	$('#prompt .text').removeClass('span-17');
	$('#users').removeClass('last');
	$('#chat').addClass('last');
	$('#users').show();
    } else {
	$('#chat, #prompt').removeClass('span-16');
	$('#chat, #prompt').addClass('span-19');
	$('#prompt').removeClass('append-4');
	$('#prompt').addClass('append-1');
	$('#prompt .text').removeClass('span-14');
	$('#prompt .text').addClass('span-17');
	$('#users').addClass('last');
	$('#chat').removeClass('last');
	$('#users').hide();
    }
};

MartIrcUi.prototype.displayCloseIcon = function(display) {
    var self = this;

    if(display){
	$('#chat .current-title img').css('visibility', 'visible');
    } else {
	$('#chat .current-title img').css('visibility', 'hidden');
    }
};
