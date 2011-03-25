$('document').ready(function(){
			$('.prompt form').submit(sendMsg);

			$('.prompt form input').focus();
		    });

function sendMsg()
{
    var prompt = $('.prompt form input').val();

    $('.prompt form input').val('');

    $('.chat div').append('<span class="msg"><span class="current-user nick">Mickael : </span>'+'<span class="txt">'+prompt+'</span></span>');

    $(".chat div").attr({ scrollTop: $(".chat div").attr("scrollHeight") });

    $('.prompt form input').focus();

    return false;
}