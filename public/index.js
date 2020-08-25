$(document).mousemove(function(e){
    $("#image").css({left:e.pageX-70, top:e.pageY-170});
});
$(document).ready(function(){
    setTimeout(function(){
        $('#first').fadeOut("slow");
        setTimeout(function(){$('body').addClass('body');},500);
        setTimeout(function(){
            $('#second').fadeIn("slow");
            $('#first').css('display','none');
            var i = 0;
            var txt = 'Tweet Analyser'; /* The text */
            var speed = 90; /* The speed/duration of the effect in milliseconds */

            function typeWriter() {
            if (i < txt.length) {
                document.getElementById("heading").innerHTML += txt.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
            }
            setTimeout(typeWriter,1000);
            setTimeout(function(){$('#content').css('display','block')},2000);
        },2000);
    },5000);
});
var checkOnce = true;
$('.input').click(function(){
    if(checkOnce) {
        $('#toggle').prop('checked',true);
        checkOnce = false;
    }
    
});

$('#done').click(function(){
    $('#dialog2 p').text('Your tweet has a postive sentiment of');
    $('#dialog3 p').text('Your tweet has a negative sentiment of');
    var input = $('textarea').val();
    if(input == '') {
        alert("No text");
    } else {
        var formData = {
            tweet: input
        }
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/analysetweet",
            data: JSON.stringify(formData),
            dataType: 'json',
            success: function (data) {
                var result = data.result;
                if(result>0){
                    $('#dialog2 p').append(" " + result*100 + "%");
                    $('#toggle2').prop('checked',true);
                }
                else {
                    $('#dialog3 p').append(" " + result*100*-1 + "%");
                    $('#toggle3').prop('checked',true);
                }
                
            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }
});

$('#clear').click(function(){
    $('#dialog2 p').text('Your tweet has a postive sentiment of');
    $('#dialog3 p').text('Your tweet has a negative sentiment of');
});