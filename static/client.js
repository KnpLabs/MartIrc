var channelList = [];
var socket = null;

function update(msg) 
{
    for(i in channelList) {
        if(channelList[i].toLowerCase() == msg.channel.toLowerCase())
            $("#messages"+i).append("&lt;"+msg.from+"&gt; "+scanMsg(msg.msg)+"<br/>");

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
        str += '<div id="tabs-'+i+'"><div id="messages'+i+'" class="messages"></div></div>';
    }

    str += '</div>';

    $('#tab_wrapper').html(str);

    $('#tabs').tabs({selected: 0, show: function() {
        for(i in channelList) 
        scroll(i);
    }});
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

    socket.on('message', function(msg) {
        if(msg.channels != null) {
            channelList = msg.channels;
            createChannels(msg.channels);
            updateAll(msg.msgs);
        } else {
            update(msg);
        }
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

        doPage(
            $('#nodeServerHost').val(),parseInt($('#nodeServerPort').val()),
            $('#ircServerHost').val(),parseInt($('#ircServerPort').val()),
            $('#nickname').val(),
            ["#knpLabs","#martirc"]
            );
    });

});
