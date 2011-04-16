$('document').ready(function(){
			$('#prompt form').submit(sendMsg);

			$('#prompt form input').focus();

			$('#chat .current-title img').live('click', removeChat);

			$('#channels div a.channel, #channels div a.user, #users .list.active a').live('click', focusOnChat);

			$("#menu .prefs").click(function(){
						    $("#connection-informations").toggle('slow');
						});
		    });

function sendMsg()
{
    var prompt = $('#prompt form input').val();

    $('#prompt form input').val('');

    $('#chat .active').append('<span class="msg"><span class="current-user nick">Mickael : </span>'+'<span class="txt">'+prompt+'</span></span>');

    focusOnPrompt();

    return false;
}

function focusOnPrompt()
{
    $("#chat .active").attr({ scrollTop: $("#chat .active").attr("scrollHeight") });

    $('#prompt form input').focus();
}

function displayUsersTab(display){

    if(display){
	$('#chat, #prompt').removeClass('span-19');
	$('#chat, #prompt').addClass('span-16');
	$('#prompt').removeClass('append-1');
	$('#prompt').addClass('append-4');
	$('#prompt .text').addClass('span-14');
	$('#prompt .text').removeClass('span-17');
	$('#users').removeClass('last');
	$('#chat').addClass('last');
	$('#users').show();
    } else {
	$('#chat, #prompt').removeClass('span-16');
	$('#chat, #prompt').addClass('span-19');
	$('#prompt').removeClass('append-4');
	$('#prompt').addClass('append-1');
	$('#prompt .text').removeClass('span-14');
	$('#prompt .text').addClass('span-17');
	$('#users').addClass('last');
	$('#chat').removeClass('last');
	$('#users').hide();
    }
}

function focusOnChat()
{
    var self = $(this);

    displayChat(self);
}

function displayChat(self)
{
    var id;
    var isPrivate = false;
    var chatTitle;

    if(self.attr('id')){
	id = self.attr('id');

	if(id == 'users' || self.is('.user')){
	    isPrivate = true;
	}

    } else {
	id = self.attr('class');

	isPrivate = true;
    }

    var channelToDisable = $('#channels .active');
    var chatAndUsersToDisable = $('#chat .active, #users .list.active');

    if(isPrivate){

	displayUsersTab(false);

	if(!$('#channels div a#'+id).get(0)){
	    var user = $('<a>').attr('id', id).attr('class', 'user').text(self.text());
	    $('#channels div').append(user);

	    var userChat = $('<div>').attr('class', id);
	    $('#chat').append(userChat);
	}
    } else {
	displayUsersTab(true);
    }

    chatAndUsersToDisable.hide();
    channelToDisable.removeClass('active');
    chatAndUsersToDisable.removeClass('active');

    if(isPrivate){
	chatTitle = 'Private : '+self.text();

	var chatToEnable = $('#chat .'+id).addClass('active');
	chatToEnable.show();
    } else {
	chatTitle = 'Public : '+self.text();

	var chatAndUsersToEnable = $('#chat .'+id+', #users .list.'+id).addClass('active');
	chatAndUsersToEnable.show();
    }

    $("#chat .current-title span").text(chatTitle);

    $('#'+id).addClass('active');

    focusOnPrompt();
}

function removeChat()
{
    var self = $(this);

    var id = $('#channels .active').attr('id');

    $('#channels  #'+id+', #chat .'+id).remove();

    if($('#channels .active').hasClass('channel')){
	$('#users .'+id).remove();
	alert($('#users .'+id));
    }

    displayChat($('#channels div a').last());
}
