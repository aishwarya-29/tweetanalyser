$(document).mousemove(function(e){
    $("#image").css({left:e.pageX, top:e.pageY-100});
});
$(document).ready(function(){
    setTimeout(function(){
        $('#first').addClass('animate__animated animate__zoomOut');
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
    },500);
});
var checkOnce = true;
$('.input').click(function(){
    if(checkOnce) {
        $('#toggle').prop('checked',true);
        checkOnce = false;
    }
        

})