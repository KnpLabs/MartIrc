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
    self.name = null;
    self.utils = new Utils();

    self.lastMessageSender = null;
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

Base.prototype.unsetActiveElements = function(){
    var self = this;

    $('#channels .active, #chat .active, #users .list.active').removeClass('active');
};

Base.prototype.showActiveElements = function(){
    var self = this;

    $('#chat .active, #users .list.active').show();
};

Base.prototype.hideActiveElements = function(){
    var self = this;

    $('#chat .active, #users .list.active').hide();
};

Base.prototype.showUsersTab = function(){
    var self = this;

    $('#chat, #prompt').removeClass('span-20');
    $('#chat, #prompt').addClass('span-16');
    $('#prompt').removeClass('append-1');
    $('#prompt').addClass('append-4');
    $('#prompt .text').addClass('span-14');
    $('#prompt .text').removeClass('span-18');
    $('#users').addClass('last');
    $('#chat').removeClass('last');
    $('#users').show();
};

Base.prototype.hideUsersTab = function(){
    var self = this;

    $('#chat, #prompt').removeClass('span-16');
    $('#chat, #prompt').addClass('span-20');
    $('#prompt').removeClass('append-4');
    $('#prompt').addClass('append-1');
    $('#prompt .text').removeClass('span-14');
    $('#prompt .text').addClass('span-18');
    $('#users').removeClass('last');
    $('#chat').addClass('last');
    $('#users').hide();
};

Base.prototype.showClosingIcon = function(){
    var self = this;

    $('#chat .close-channel-button').show();
};

Base.prototype.hideClosingIcon = function(){
    var self = this;

    $('#chat .close-channel-button').hide();
};


Base.prototype.addMessage = function(nickname, message, msgClasses, txtClasses, nickClasses){
    var self = this;

    var messageBlock = $('<div>').addClass('msg '+msgClasses+' clear');
    messageBlock.append($('<span>').addClass(nickClasses+' span-2').text(nickname));
    messageBlock.append($('<span>').addClass('txt '+txtClasses+' last').append(message));

    $("#chat ."+self.id).append(messageBlock);
};

Base.prototype.appendToLastMessage = function(message, txtClasses){
    var self = this;

    $("#chat ."+self.id+' .msg').last().append($('<span>').addClass('txt '+txtClasses+' last').append(message));
};

Base.prototype.scrollAtTheEnd = function(){
    var self = this;

    $("#chat ."+self.id).prop({
        scrollTop: $("#chat ."+self.id).prop("scrollHeight")
    });
};

Base.prototype.focus = function(title){
    var self = this;

    self.hideActiveElements();
    self.unsetActiveElements();
    self.setActiveElements();
    self.showActiveElements();

    self.scrollAtTheEnd();
    self.focusOnPrompt();

    $("#chat .current-title span").text(title);
    $("#chat .current-title span").removeAttr('title');
};

Base.prototype.focusOnPrompt = function(){
    var self = this;

    $('#prompt form input').focus();
};
