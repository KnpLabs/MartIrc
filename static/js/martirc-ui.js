/**
* Main ui constructor
*
* @contructor
*
*/
MartIrcUi = function(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.ircClient = options.ircClient;

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

        $('#connection-informations').hide();
        self.drawBasicClient();

    });

    $(self.ircClient).bind('irc.server',function(event, data) { 
        self.displayServerMessage(data.raw);
    });
};

MartIrcUi.prototype.displayServerMessage = function(message) {
    var self = this;

    console.log('Notice: ' + message);

    $("#messages0").append(self.scanMsg(message)+"<br/>");
    self.scroll(0);
}

MartIrcUi.prototype.drawBasicClient = function() {
    var self = this;

    var list = ['Server'];

    str = '<div id="tabs"><ul>';

    for(i in list) {
        str += '<li><a href="#tabs-'+i+'">'+list[i].toLowerCase()+'</a></li>';
    }

    str += '</ul>';

    for(i in list) {
        str += '<div id="tabs-'+i+'"><div id="messages'+i+'" class="messages"></div>';
        str += '<div id="inputs-'+i+'"><input type="text" id="input-text'+i+'" class="input-message"/></div>';
        str += '</div>';
    }

    str += '</div>';

    $('#tab_wrapper').html(str);

    $('.input-message').each(function() {
       $(this).keypress(function(e)
        {
            code= (e.keyCode ? e.keyCode : e.which);
            if (code == 13) {
                //sendMsgToActiveChannel($(this).val());
                $(this).val('');
            }
        });
    });
}


MartIrcUi.prototype.scanMsg = function(msg) 
{
    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return msg.replace(regex," <a href=\"$&\" target=\"_blank\">$&</a> ");
}

MartIrcUi.prototype.scroll = function(i) 
{
    $("#messages"+i).scrollTop(9999999);
}

