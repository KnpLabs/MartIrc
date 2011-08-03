/*
 * UserWidget constructor
 *
 * @constructor
 */
UserWidget = function(data){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    BaseWidget.prototype.constructor.call(self, data);
};

UserWidget.prototype = new BaseWidget();
UserWidget.prototype.constructor = UserWidget;

UserWidget.prototype.create = function(){
    var self = this;

    $('#channels').append($('<a>').prop('id', self.data.id).addClass('user').text(self.data.nickname));
    $('#chat').append($('<div>').addClass(self.data.id));
};

UserWidget.prototype.addMessage = function(nickname, message){
    var self = this;

    var color = null;

    if(nickname !== self.data.nickname){
        color = 'current-user';
    } else{
        color = self.data.color;
    }

    if(self.data.lastMessageSender != nickname){
	BaseWidget.prototype.addMessage.call(self, nickname, message, 'span-20', 'span-18', color+' nick');

	self.data.lastMessageSender = nickname;
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};

UserWidget.prototype.rename = function(oldNickname){
    var self = this;

    if($('#channels #user-'+$.sha1(oldNickname)).get(0)){
        $('#channels #user-'+$.sha1(oldNickname)).text(self.data.nickname);
        $('#channels #user-'+$.sha1(oldNickname)).prop('id', self.data.id);
        $('#chat .user-'+$.sha1(oldNickname)).removeClass(self.data.id);
        $('#chat .user-'+$.sha1(oldNickname)).addClass(self.data.id);

        if(self.isActive()){
            $("#chat .current-info .title").text('Chat with '+self.data.nickname);
        }
    };

    if($('#users .user-'+$.sha1(oldNickname)).get(0)){
        $('#users .user-'+$.sha1(oldNickname)).text(self.data.nickname);
        $('#users .user-'+$.sha1(oldNickname)).prop('id', self.data.id);
    }
};

UserWidget.prototype.focus = function(){
    var self = this;

    BaseWidget.prototype.focus.call(self, 'Chat with '+self.data.nickname);

    self.hideUsersTab();
    self.showClosingIcon();
};

UserWidget.prototype.destroy = function(){
    var self = this;

    if(!self.data.id){
        return;
    }

    $('#channels  #' + self.data.id + ', #chat .' + self.data.id).remove();
};
