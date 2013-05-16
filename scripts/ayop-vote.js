/*
 * Handles votes for or against special frames.
 */

//http://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
$("#vote #yes").click(function() {
    $.ajax({
        type: "POST",
        url: "./scripts/vote.php",
        data: "frame=" + currentFrame + "&vote=voteyes",
        success: function(data) {
            alert(data);
        }
    });
    return false; // avoid to execute the actual submit of the form.
});

$("#vote #no").click(function() {
    $.ajax({
        type: "POST",
        url: "./scripts/vote.php",
        data: "frame=" + currentFrame + "&vote=voteno",
        success: function(data) {
            alert(data);
        }
    });
    return false; // avoid to execute the actual submit of the form.
});