$('document').ready(function(){
			$('#prompt form').submit(sendMsg);

			$('#prompt form input').focus();

			$('#channels div a.channel').live('click', focusOnChannel);

			$('#channels div a.user').live('click', focusOnUser);

			$('#users .list.active a').live('click', focusOnUser);

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

function focusOnChannel()
{
    var self = $(this);

    var id = self.attr('id');
    var channelToDisable = $('#channels .active');
    var chatAndUsersToDisable = $('#chat .active, #users .list.active');

    displayUsersTab(true);

    chatAndUsersToDisable.hide();
    channelToDisable.removeClass('active');
    chatAndUsersToDisable.removeClass('active');

    var chatAndUsersToEnable = $('#chat .'+id+', #users .list.'+id).addClass('active');
    chatAndUsersToEnable.show();

    $('#'+id).addClass('active');

    focusOnPrompt();
}

function focusOnUser()
{
    var self = $(this);

    var id;

    if(self.attr('id')){
	id = self.attr('id');
    } else {
	id = self.attr('class');
    }

    var channelToDisable = $('#channels .active');
    var chatAndUsersToDisable = $('#chat .active, #users .list.active');

    displayUsersTab(false);

    if(!$('#channels div a#'+id).get(0)){
	var user = $('<a>').attr('id', id).attr('class', 'user').text(self.text());
	$('#channels div').append(user);

	var userChat = $('<div>').attr('class', id);
	$('#chat').append(userChat);
    }

    chatAndUsersToDisable.hide();
    channelToDisable.removeClass('active');
    chatAndUsersToDisable.removeClass('active');

    var chatToEnable = $('#chat .'+id).addClass('active');
    chatToEnable.show();

    $('#'+id).addClass('active');

    focusOnPrompt();
}
