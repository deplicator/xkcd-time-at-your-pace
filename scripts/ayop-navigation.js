/*jslint browser: true, sloppy: true, indent: 4, eqeq: true*/
/*global $, updateAll, frameCount, currentFrame, addWheelListener, slider, scrollhere, isSpecial, nextSpecial, prevSpecial:false */
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
    pause();
    updateAll(1);
}

function lastFrame() {
    pause();
    updateAll(frameCount);
}

//Pass a true value to continue autoplay.
function prevFrame(nopause) {
    if(!nopause) {
        pause();
    }
    var nextslideindex = currentFrame - 1;
    nextslideindex = (nextslideindex < 1) ? frameCount : (nextslideindex > frameCount) ? 1 : nextslideindex;
    updateAll(nextslideindex);
}

//Pass a true value to continue autoplay.
function nextFrame(nopause) {
    if(!nopause) {
        pause();
    }
    var nextslideindex = currentFrame + 1;
    if (nextslideindex > frameCount) {
        nextslideindex = 1;
    }
    updateAll(nextslideindex);
}

function prevSpecialFrame() {
    pause();
    updateAll(prevSpecial(currentFrame));
}

function nextSpecialFrame() {
    pause();
    updateAll(nextSpecial(currentFrame));
}

function prevDebatedFrame() {
    pause();
    updateAll(prevDebated(currentFrame));
}

function nextDebatedFrame() {
    pause();
    updateAll(nextDebated(currentFrame));
}


/*
 * Keyboard inputs
 */
$(document).keydown(function (e) {
    if(!($("#manualinput").is(":focus"))) {
        if (e.which == 37) { //left-key-pressed
            if(e.ctrlKey && e.shiftKey) {
                firstFrame();
            } else if(e.ctrlKey) {
                prevSpecialFrame();
            } else if(e.shiftKey) {
                prevDebatedFrame();
            } else {
                prevFrame();
            }
            e.preventDefault();
        } else if (e.which == 39) { //right-key-pressed
            if(e.ctrlKey && e.shiftKey) {
                lastFrame();
            } else if(e.ctrlKey) {
                nextSpecialFrame();
            } else if(e.shiftKey) {
                nextDebatedFrame();
            } else {
                nextFrame();
            }
            e.preventDefault();
        } else if (e.which == 32) { //space-bar-pressed
            if($('#play').val() == "Play") {
              unpause();
            } else {
              pause();
            }
            e.preventDefault();
        }
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
var playforward = $.timer(function () {
    if (currentFrame >= frameCount) {
        updateAll(1);
    }
    if (isSpecial(currentFrame)) {
        specialframecounter += speed;
        if (specialframecounter < (parseInt($('#PauseSpecialFrameAmount').val(), 10) || 0) * 1000) {
            return;//should pause x seconds...
        }
    }
    specialframecounter = 0;
    updateAll(currentFrame + 1);
    if (currentFrame >= frameCount) {
        playforward.stop();
        $('#play').val("Play");
        $('.vote').show('fast');
    }
});

//same as above, but backwards
var playreverse = $.timer(function () {
    if (currentFrame <= 1) {
        updateAll(frameCount);
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
        $('.vote').show('fast');
    }
});

/*
 * Pause playback, rename play button, show vote buttons.
 *
 * This is safe to call several times.
 */
function pause() {
    // Pause playback
    playforward.stop();
    playreverse.stop();
    // Rename play button
    $('#play').val("Play");
    // Show vote buttons
    $('.vote').show('fast');
}

/*
 * Unpause/start playback, rename play button, hide vote buttons.
 * Also makes sure that the playback timers don't pause on the current frame because it's special.
 *
 * This is safe to call several times; if the playback is currently "semi-paused" for a special frame,
 * this will continue immediately.
 */
function unpause() {
    // Prevent the timers to pause on the current frame
    specialframecounter =  (parseInt($('#PauseSpecialFrameAmount').val(), 10) || 0) * 1000 + 100;
    // Unpause/start playback
    if ($('#forward').hasClass('dir-select')) {
        playforward.set({
            time: speed,
            autostart: true
        });
    } else {
        playreverse.set({
            time: speed,
            autostart: true
        });
    }
    // Rename play button
    $('#play').val("Pause");
    // Hide vote buttons
    $('.vote').hide('fast');
}

$(document).ready(function () {
    //Play-pause button start and stop auto play back and change button text.
    $('#play').click(function () {
        if ($('#play').val() == "Play") {
            unpause();
        } else {
            pause();
        }
    });

    //Change directions on the fly.
    $('#reverse').click(function () {
        if (playforward.isActive) {
            playforward.stop();
            playreverse.set({
                time: speed,
                autostart: true
            });
        }
    });

    $('#forward').click(function () {
        if (playreverse.isActive) {
            playreverse.stop();
            playforward.set({
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
        playforward.set({
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
    var numspecialframes = specialFrames.length;
    var specialtime = numspecialframes * $('#PauseSpecialFrameAmount').val();
    var ordinarytime = (frameCount - numspecialframes) * speed / 1000;
    return specialtime + ordinarytime + " seconds";
}
