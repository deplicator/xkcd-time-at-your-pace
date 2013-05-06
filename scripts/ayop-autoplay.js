/*
 * Autoplay stuff
 */

var specialframecounter = 0;
var speed = 100; //.1 seconds per frame (10fps) default for start.

// Thanks to jfriend00 on http://stackoverflow.com/questions/10264239/fastest-way-to-determine-if-an-element-is-in-a-sorted-array
function binary_search_iterative(a, value) {
    var lo = 0, hi = a.length - 1, mid;
    while (lo <= hi) {
        mid = Math.floor((lo+hi)/2);
        if (a[mid] > value)
            hi = mid - 1;
        else if (a[mid] < value)
            lo = mid + 1;
        else
            return mid;
    }
    return null;
}

function isSpecial(frame) {
    return binary_search_iterative(specialframes,frame) != null;
}

//https://code.google.com/p/jquery-timer/
var timer = $.timer(function() {
    if(isSpecial(currentFrame)) {
        specialframecounter += speed;
        if(specialframecounter < (parseInt($('#PauseSpecialFrameAmount').val(),10) || 0)*1000) {
            return;//should pause x seconds... 
        }
        else {
            specialframecounter=0;
        }
    }
    currentFrame++;
    updateAll(currentFrame);
    if (currentFrame >= (framecount)) {
        timer.stop();
        $('#play').val("Play");
    }
});

$('#play').click(function () {
    if ($('#play').val() == "Play") {
        $('#play').val("Pause");
        if (currentFrame >= (framecount)) {
            updateAll(1);
        }
        timer.set({
            time: speed,
            autostart: true
        });
    } else {
        $('#play').val("Play");
        timer.stop();
    }
});

$('#autoplayspeed').change(function() {
    if($('#autoplayspeed').val() <= 0) {
        $('#autoplayspeed').val(1);
    }
    var newspeed = parseInt($('#autoplayspeed').val(), 10);
    speed = (1/newspeed) * 1000;
    timer.set({
        time: speed,
        autoplay: true
    });
});