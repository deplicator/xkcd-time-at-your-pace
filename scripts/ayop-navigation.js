/*jslint browser: true, sloppy: true, indent: 4, eqeq: true*/
/*global $, updateAll, framecount, currentFrame, addWheelListener, slider, scrollhere, isSpecial, nextSpecial, prevSpecial:false */
/*
 * Navigation
 * Handels auto play back, frame steps, keyboard input, slider, and scrolling.
 */

var specialframecounter = 0;
var speed = 100; //.1 seconds per frame (10fps) default for autoplay start.

/*
 * Generic navigation functions.
 * No parameters, work as expected.
 */
function firstFrame() {
    $('#play').val("Play");
    timer.stop();
    updateAll(1);
}

function lastFrame() {
    $('#play').val("Play");
    timer.stop();
    updateAll(framecount);
}

//Pass a true value to continue autoplay.
function prevFrame(nopause) {
    if(!nopause) {
        $('#play').val("Play");
        timer.stop();
    }
    var nextslideindex = currentFrame - 1;
    nextslideindex = (nextslideindex < 1) ? framecount : (nextslideindex > framecount) ? 1 : nextslideindex;
    updateAll(nextslideindex);
}

//Pass a true value to continue autoplay.
function nextFrame(nopause) {
    if(!nopause) {
        $('#play').val("Play");
        timer.stop();
    }
    var nextslideindex = currentFrame + 1;
    if (nextslideindex > framecount) {
        nextslideindex = 1;
    }
    updateAll(nextslideindex);
}

function prevSpecialFrame() {
    $('#play').val("Play");
    timer.stop();
    updateAll(prevSpecial(currentFrame));
}

function nextSpecialFrame() {
    $('#play').val("Play");
    timer.stop();
    updateAll(nextSpecial(currentFrame));
}


/*
 * Keyboard inputs
 * TODO: Modifier keys to skip to special frames and first and last might be neat. Example:
 *       ctrl+right arrow move to next special frame
 *       ctrl+shift+right arrow move to last frame
 */
$(document).keydown(function (e) {
    if (e.which == 37) { //left-key-pressed
        prevFrame();
    } else if (e.which == 39) { //right-key-pressed
        nextFrame();
    }
});


/*
 * Scrolling code.
 */
function scrollHandler(e) {
    //Delta was allways = 3 in my tests with Firefox and Chrome. 
    //Maybe we can use it to determine the speed, but for now we only scroll one frame.
    var delta = e.deltaY != 0 ? e.deltaY : (e.deltaX != 0 ? e.deltaX : 0);
    if (delta < 0) { //Up or left-Scroll
        prevFrame(true);
    } else if (delta > 0) { //Down or Right-Scroll
        nextFrame(true);
    }
    e.preventDefault();
}


//https://code.google.com/p/jquery-timer/
//TODO: Changer timer to something useful, like playforward.
var timer = $.timer(function () {
    if (currentFrame >= framecount) {
        updateAll(1);
    }
    if (isSpecial(currentFrame)) {
        specialframecounter += speed;
        if (specialframecounter < (parseInt($('#PauseSpecialFrameAmount').val(), 10) || 0) * 1000) {
            return;//should pause x seconds... 
        } else {
            specialframecounter = 0;
        }
    }
    updateAll(currentFrame + 1);
    if (currentFrame >= framecount) {
        timer.stop();
        $('#play').val("Play");
    }
});

//same as above, but backwards
var playreverse = $.timer(function () {
    if (currentFrame <= 1) {
        updateAll(framecount);
    }
    if (isSpecial(currentFrame)) {
        specialframecounter += speed;
        if (specialframecounter < (parseInt($('#PauseSpecialFrameAmount').val(), 10) || 0) * 1000) {
            return;//should pause x seconds... 
        } else {
            specialframecounter = 0;
        }
    }
    updateAll(currentFrame - 1);
    if (currentFrame <= 1) {
        playreverse.stop();
        $('#play').val("Play");
    }
});


$(document).ready(function () {
    //Play-pause button start and stop auto play back and change button text.
    $('#play').click(function () {
        if ($('#play').val() == "Play") {
            $('#play').val("Pause");
            if ($('#forward').hasClass('dir-select')) {
                timer.set({
                    time: speed,
                    autostart: true
                });
            } else {
                playreverse.set({
                    time: speed,
                    autostart: true
                });
            }
        } else {
            $('#play').val("Play");
            timer.stop();
            playreverse.stop();
        }
    });

    //Change directions on the fly.
    $('#reverse').click(function () {
        if (timer.isActive) {
            timer.stop();
            playreverse.set({
                time: speed,
                autostart: true
            });
        }
    });

    $('#forward').click(function () {
        if (playreverse.isActive) {
            playreverse.stop();
            timer.set({
                time: speed,
                autostart: true
            });
        }
    });


    //Changes playback speed from input, should work on the fly.
    $('#autoplayspeed').change(function () {
        if ($('#autoplayspeed').val() <= 0) {
            $('#autoplayspeed').val(1);
        }
        var newspeed = parseInt($('#autoplayspeed').val(), 10);
        speed = (1 / newspeed) * 1000;
        timer.set({
            time: speed,
            autoplay: true
        });
        playreverse.set({
            time: speed,
            autoplay: true
        });
    });


    /*
     * Handlers
     */
    $('#first').click(firstFrame);
    $('#last').click(lastFrame);
    $('#previous').click(function() {
        prevFrame();
    });
    $('#next').click(function() {
        nextFrame();
    });
    $('#previous-special').click(prevSpecialFrame);
    $('#next-special').click(nextSpecialFrame);
    addWheelListener(slider, scrollHandler);
    addWheelListener(scrollhere, scrollHandler);
});


//This function is not called anywhere, testing only. Playback time is terribly inaccurate. My guess
//it will vary on different computers if all the images are preloaded. Left here for fun.
function timetoplay() {
    var numspecialframes = specialframes.length;
    var specialtime = numspecialframes * $('#PauseSpecialFrameAmount').val();
    var ordinarytime = (framecount - numspecialframes) * speed / 1000;
    return specialtime + ordinarytime + " seconds";
}