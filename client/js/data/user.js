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

User.prototype.rename = function(nickname){
    var self = this;

    self.nickname = nickname;
    self.id = 'user-'+$.sha1(nickname);
};