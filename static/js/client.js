var channelList = [];
var socket = null;

function update(msg) 
{
    for(i in channelList) {
        console.log(msg.channel);
        if(channelList[i].toLowerCase() == msg.channel.toLowerCase())
            $("#messages"+i).append("&lt;"+msg.from+"&gt; "+scanMsg(msg.content)+"<br/>");

        scroll(i);
    }

}

function updateAll(list)
{
    for(i in list) {
        for(j in channelList) {
            if(channelList[j].toLowerCase() == list[i].channel.toLowerCase())
                $("#messages"+j).append("&lt;"+list[i].from+"&gt; "+scanMsg(list[i].msg)+"<br/>");
        }
    }

    for(i in channelList)
        scroll(i);
}

function scanMsg(msg) 
{
    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return msg.replace(regex," <a href=\"$&\" target=\"_blank\">$&</a> ");
}

function sendMsgToActiveChannel(msg)
{
    var activeChannel = $.trim($('#tabs>ul>li.ui-state-active>a').html());
    var data = {
        type: 'privmsg', data:
        {
            channel:activeChannel,
            message:msg
        }
    };

    socket.send(data);
}

function scroll(i) 
{
    $("#messages"+i).scrollTop(9999999);
}

function createChannels(list) 
{
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

    $('#tabs').tabs({selected: 0, show: function() {
        for(i in channelList) 
        scroll(i);
    }});

    $('.input-message').each(function() {
       $(this).keypress(function(e)
        {
            code= (e.keyCode ? e.keyCode : e.which);
            if (code == 13) {
                sendMsgToActiveChannel($(this).val());
                $(this).val('');
            }
        });
    });
}

function parseIncomingMessage(incomingMessage) {
    
    console.log('message received: ' + incomingMessage.content);

    var message = {
        channel: 'server',
        content: incomingMessage.content
    }

    var compiler = new Compiler();
    console.log(compiler.compile(message.content));

    return message;
}

function doPage(nodeServerHost, nodeServerPort, ircServerHost, ircServerPort, nickname, channels)
{
    socket = new io.Socket(nodeServerHost, {port: nodeServerPort});
    socket.connect();

    var data = {
        type: 'connect', data: 
        {
            ircHost:ircServerHost, 
            ircPort:ircServerPort, 
            nick:nickname,
            channels:channels
        }
    };

    socket.send(data);

    channelList = ['server'];
    createChannels(channelList);

    socket.on('message', function(incomingMessage) {

        var message = parseIncomingMessage(incomingMessage);
        update(message);

    });
}

$(document).ready(function() {
    if(!"WebSocket" in window) {
        window.location = "error.html";
    }

    $('#connectButton').click(function() {

        if(socket && socket.connected){
            socket.disconnect();
        }

        //Basic input cleaning
        var channels = $('#channels').val().split("\n");
        for(i in channels.size) {
            channels[i] = $.trim(channels[i]);
        }

        doPage(
            $('#nodeServerHost').val(),parseInt($('#nodeServerPort').val()),
            $('#ircServerHost').val(),parseInt($('#ircServerPort').val()),
            $('#nickname').val(),
            channels
            );
    });

});
