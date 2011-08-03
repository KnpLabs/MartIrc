/**
 * BaseWidget ui constructor
 *
 * @contructor
 *
 */
BaseWidget = function(data) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.data = data;
    self.utils = new Utils();
};

BaseWidget.prototype.isActive = function(){
    var self = this;

    return ($('#channels .active').get(0) === $('#channels #'+self.data.id).get(0));
};

BaseWidget.prototype.isCreated = function(){
    var self = this;

    return ($('#channels #'+self.data.id).length);
};

BaseWidget.prototype.setActiveElements = function(){
    var self = this;

    $('#channels #' + self.data.id + ', #chat .' + self.data.id).addClass('active');

    if($('#users .'+self.data.id).get(0)){
        $('#users .'+self.data.id).addClass('active');
    }
};

BaseWidget.prototype.unsetActiveElements = function(){
    var self = this;

    $('#channels .active, #chat .active, #users .list.active').removeClass('active');
};

BaseWidget.prototype.showActiveElements = function(){
    var self = this;

    $('#chat .active, #users .list.active').show();
};

BaseWidget.prototype.hideActiveElements = function(){
    var self = this;

    $('#chat .active, #users .list.active').hide();
};

BaseWidget.prototype.showUsersTab = function(){
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

BaseWidget.prototype.hideUsersTab = function(){
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

BaseWidget.prototype.showClosingIcon = function(){
    var self = this;

    $('#chat .close-channel').show();
};

BaseWidget.prototype.hideClosingIcon = function(){
    var self = this;

    $('#chat .close-channel').hide();
};


BaseWidget.prototype.addMessage = function(nickname, message, msgClasses, txtClasses, nickClasses){
    var self = this;

    var messageBlock = $('<div>').addClass('msg '+msgClasses+' clear');
    messageBlock.append($('<span>').addClass(nickClasses+' span-2').text(nickname));
    messageBlock.append($('<span>').addClass('txt '+txtClasses+' last').append(message));

    $("#chat ."+self.data.id).append(messageBlock);
};

BaseWidget.prototype.appendToLastMessage = function(message, txtClasses){
    var self = this;

    $("#chat ."+self.data.id+' .msg').last().append($('<span>').addClass('txt '+txtClasses+' last').append(message));
};

BaseWidget.prototype.scrollAtTheEnd = function(){
    var self = this;

    $("#chat ."+self.data.id).prop({
        scrollTop: $("#chat ."+self.data.id).prop("scrollHeight")
    });
};

BaseWidget.prototype.focus = function(title){
    var self = this;

    self.hideActiveElements();
    self.unsetActiveElements();
    self.setActiveElements();
    self.showActiveElements();

    self.scrollAtTheEnd();
    self.focusOnPrompt();

    $("#chat .current-info .title").text(title);
    $("#chat .current-info .title").removeAttr('title');
};

BaseWidget.prototype.focusOnPrompt = function(){
    var self = this;

    $('#prompt form input').focus();
};
