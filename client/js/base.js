/**
 * Base ui constructor
 *
 * @contructor
 *
 */
Base = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.id = null;
    self.utils = new Utils();
};

Base.prototype.isActive = function(){
    var self = this;

    return ($('#channels .active').get(0) === $('#channels .'+self.id).get(0));
};

Base.prototype.isCreated = function(){
    var self = this;

    return ($('channels #'+self.id).get(0) !== null);
};

Base.prototype.setActiveElements = function(){
    var self = this;

    $('#channels #' + self.id + ', #chat .' + self.id).addClass('active');

    if($('#users .'+self.id).get(0)){
	$('#users .'+self.id).addClass('active');
    }
};

Base.prototype.showActiveElements = function(){
    var self = this;

    var channelChatAndUsersToEnable = $('#channels #' + self.id + ', #chat .' + self.id + ', #users .list.' + self.id).addClass('active');
    channelChatAndUsersToEnable.show();
};

Base.prototype.hideActiveElements = function(){
    var self = this;

    var channelToDisable = $('#channels .active');
    var chatAndUsersToDisable = $('#chat .active, #users .list.active');

    chatAndUsersToDisable.hide();
    channelToDisable.removeClass('active');
    chatAndUsersToDisable.removeClass('active');
};

Base.prototype.showUsersTab = function(){
    var self = this;

    $('#chat, #prompt').removeClass('span-19');
    $('#chat, #prompt').addClass('span-16');
    $('#prompt').removeClass('append-1');
    $('#prompt').addClass('append-4');
    $('#prompt .text').addClass('span-14');
    $('#prompt .text').removeClass('span-17');
    $('#users').removeClass('last');
    $('#chat').addClass('last');
    $('#users').show();
};

Base.prototype.hideUsersTab = function(){
    var self = this;

    $('#chat, #prompt').removeClass('span-16');
    $('#chat, #prompt').addClass('span-19');
    $('#prompt').removeClass('append-4');
    $('#prompt').addClass('append-1');
    $('#prompt .text').removeClass('span-14');
    $('#prompt .text').addClass('span-17');
    $('#users').addClass('last');
    $('#chat').removeClass('last');
    $('#users').hide();
};

Base.prototype.showClosingIcon = function(){
    var self = this;

    $('#chat .current-title img').show();
};

Base.prototype.hideClosingIcon = function(){
    var self = this;

    $('#chat .current-title img').hide();
};


Base.prototype.addMessage = function(nickname, message, id, classes){
    var self = this;

    var messageBlock = $('<span>').addClass('msg');
    messageBlock.append($('<span>').addClass(classes).text(nickname));
    messageBlock.append($('<span>').addClass('txt').append(message));

    $("#chat ."+id).append(messageBlock);
};

Base.prototype.focusOnPrompt = function(){
    var self = this;

    $("#chat .active").attr({
        scrollTop: $("#chat .active").attr("scrollHeight")
    });

    $('#prompt form input').focus();
};
