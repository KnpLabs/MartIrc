/**
 * Storage constructor
 *
 * @contructor
 *
 */
Storage = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    if(!$.cookies.get('martirc')){
        $.cookies.setOptions({expiresAt: new Date( 2013, 1, 1 )});
        $.cookies.set('martirc', new Object());
    }
};

Storage.prototype.addChannel = function(name, ircServerHost){
    var self = this;

    var cookieData = $.cookies.get('martirc');

    if(!cookieData['channels']){
        cookieData['channels'] = new Object();
    }

    cookieData['channels'][ircServerHost] = cookieData['channels'].hasOwnProperty(ircServerHost) ? cookieData['channels'][ircServerHost] : new Array();

    if(jQuery.inArray(name, cookieData['channels'][ircServerHost]) == -1){
        cookieData['channels'][ircServerHost].push(name);
        $.cookies.set('martirc', cookieData);
    }
};

Storage.prototype.removeChannel = function(name, ircServerHost) {
    var self = this;

    var cookieData = $.cookies.get('martirc');

    if(!cookieData['channels'] || !cookieData['channels'][ircServerHost]){
        return;
    }

    cookieData['channels'][ircServerHost].splice(cookieData['channels'][ircServerHost].indexOf(name), 1);

    $.cookies.set('martirc', cookieData);
};

Storage.prototype.getChannels = function(ircServerHost) {
    var self = this;

    var channels = new Array();
    var cookieData = $.cookies.get('martirc');

    if(!cookieData['channels'] || !cookieData['channels'][ircServerHost]){
        return channels;
    }

    var names = cookieData['channels'][ircServerHost];

    for(i in names){

        if(names[i][0] === '#'){
            channels[names[i]] = new Channel(names[i]);
        } else {
            channels[names[i]] = new User(names[i]);
        }
    }

    return channels;
};

Storage.prototype.setConnectOnStartup = function(connect) {
    var self = this;

    var cookieData = $.cookies.get('martirc');

    cookieData['connect'] = connect;
    $.cookies.set('martirc', cookieData);
};

Storage.prototype.getConnectOnStartup = function(connect) {
    var self = this;

    var cookieData = $.cookies.get('martirc');

    if(!cookieData['connect']){
        return false;
    }

    return cookieData['connect'];
};

Storage.prototype.setNickname = function(nickname) {
    var self = this;

    var cookieData = $.cookies.get('martirc');

    cookieData['nickname'] = nickname;
    $.cookies.set('martirc', cookieData);
};

Storage.prototype.getNickname = function() {
    var self = this;

    var cookieData = $.cookies.get('martirc');

    if(!cookieData['nickname']){
        return null;
    }

    return cookieData['nickname'];
};
