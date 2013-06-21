/*
 * Handles votes for or against special frames.
 */

//http://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
function castVote(frame, cast) {
    $.ajax({
        type: "POST",
        url: "./scripts/vote.php",
        data: "frame=" + currentFrame + "&vote=" + cast,
        success: function(data) {
            $('#voteconfirm').fadeIn('fast');
            if(data == "success") {
                if(cast == "voteyes") {
                    frameData[frame].yes = parseInt(frameData[frame].yes) + 1; //Change local data. A refresh will loose these, but they will come back.
                    $('#voteconfirm').append("<li>Your vote for " + frame + " has been cast.</li>");
                } else if(cast == "voteno") {
                    frameData[frame].no = parseInt(frameData[frame].no) + 1; 
                    $('#voteconfirm').append("<li>You voted against " + frame + ".</li>");
                }
                if (currentFrame == frame) {
                    $('#yay').html(frameData[frame].yes);
                    $('#nay').html(frameData[frame].no);
                }
            } else if (data == "fail") {
                $('#voteconfirm').append("<li>You've reached the daily vote limit. Your contribution to this cause will go unnoticed.</li>");
            } else {
                $('#voteconfirm').append("<li>Something has failed. <a href=\"mailto:james@geekwagon?subject=your%20site%20failed%20and%20I%20was%20quick%20enough%20to%20click%20this!\">Click here quick</a>, before it's too late!</li>");
            }
            $('#voteconfirm li').delay(5000).fadeOut('slow');
        }
    });
    return false; // avoid to execute the actual submit of the form.
}

$("#yes.vote").click(function() {
    castVote(currentFrame, "voteyes");
});

$("#no.vote").click(function() {
    castVote(currentFrame, "voteno");
});

$('#showvoteinfo').click(function() {
    if($('#voteinfo').hasClass('hidden')) {
        $('#showvoteinfo').html("</a>hide info</a>");
        $('#voteinfo').removeClass('hidden');
    } else {
        $('#showvoteinfo').html("</a>more info</a>");
        $('#voteinfo').addClass('hidden');
    }
});