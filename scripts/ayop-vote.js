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
            if(data == 1) {
                if(cast == "voteyes") {
                    $('#voteconfirm').html("Your vote for " + frame + " has been cast.");
                } else if(cast == "voteno") {
                    $('#voteconfirm').html("You voted against " + frame + ".");
                }
            } if (data == 0) {
                $('#voteconfirm').html("You've reached the daily vote limit. Your contribution to this cause will go unnoticed.");
            } else {
                $('#voteconfirm').html("Something has failed. <a href=\"mailto:james@geekwagon?subject=your%20site%20failed%20and%20I%20was%20quick%20enough%20to%20click%20this!\">Click here quick</a>, before it's too late!");
            }
            $('#voteconfirm').delay(5000).fadeOut('slow');
        }
    });
    return false; // avoid to execute the actual submit of the form.
}

$("#vote #yes").click(function() {
    castVote(currentFrame, "voteyes");
});

$("#vote #no").click(function() {
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