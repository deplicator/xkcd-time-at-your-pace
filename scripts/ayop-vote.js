/*
 * Handles votes for or against special frames.
 */
$("#vote #yes").click(function() {
    $.ajax({
        type: "POST",
        url: "./scripts/vote.php",
        data: "frame=" + currentFrame + "&vote=voteyes",
        success: function(data) {
            alert("Thanks for voting");
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
            alert("Thanks for voting");
        }
    });
    return false; // avoid to execute the actual submit of the form.
});