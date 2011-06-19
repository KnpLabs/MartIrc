/*
* User constructor
*
* @constructor
*/
User = function(nickname){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    User.color = User.color > 48800 || typeof User.color == 'undefined' ? 1 : User.color+1;

    self.id = 'user-'+$.sha1(nickname);
    self.nickname = nickname;
    self.color = 'color-'+User.color;
};

User.prototype = new Base();
User.prototype.constructor = User;

User.prototype.create = function(){
    var self = this;

    $('#channels').append($('<a>').prop('id', self.id).addClass('user').text(self.nickname));
    $('#chat').append($('<div>').addClass(self.id));
};

User.prototype.addMessage = function(nickname, message){
    var self = this;

    var color = null;

    if(nickname !== self.nickname){
        color = 'current-user';
    } else{
        color = self.color;
    }

    if(self.lastMessageSender != nickname){
	Base.prototype.addMessage.call(self, nickname, message, 'span-20', 'span-18', color+' nick');

	self.lastMessageSender = nickname;
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};

User.prototype.rename = function(nickname){
    var self = this;

    var oldId = self.id;

    self.nickname = nickname;
    self.id = 'user-'+$.sha1(nickname);

    if($('#channels #'+oldId).get(0)){
        $('#channels #'+oldId).text(self.nickname);
        $('#channels #'+oldId).prop('id', self.id);
        $('#chat .'+oldId).removeClass(self.id);
        $('#chat .'+oldId).addClass(self.id);

        if(self.isActive()){
            $("#chat .current-info .title").text('Chat with '+self.nickname);
        }
    };

    if($('#users .'+oldId).get(0)){
        $('#users .'+oldId).text(self.nickname);
        $('#users .'+oldId).prop('id', self.id);
    }
};

User.prototype.focus = function(){
    var self = this;

    Base.prototype.focus.call(self, 'Chat with '+self.nickname);

    self.hideUsersTab();
    self.showClosingIcon();
};

User.prototype.destroy = function(){
    var self = this;

    if(!self.id){
        return;
    }

    $('#channels  #' + self.id + ', #chat .' + self.id).remove();
};
