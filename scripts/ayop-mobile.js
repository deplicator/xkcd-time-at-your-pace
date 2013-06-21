/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global $, BrowserDetect, ctx3, diff,addWheelListener, preloadFrame, updatePreloadingIndicator, getLastSeen: false */

/*
 * Mobile site javascript, pretty much cobbeled together from all the other ayop scripts so that
 * mobile can stay seperate.
 */

//Fix console.log for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () {};
}

var frameData = [];
var frameCount = 0;
var frameInitial = 1;
var currentFrame = 1;
var specialFrames = [];

var scrollhere = document.getElementById("scrollhere");
var site = document.URL.substring(0, document.URL.lastIndexOf("/"));


//From: http://jquery-howto.blogspot.de/2009/09/get-url-parameters-values-with-jquery.html
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash, i;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var vars = getUrlVars();
if (vars.frame && !isNaN(vars.frame)) {
    frameInitial = parseInt(vars.frame, 10);
} else {
    if (getLastSeen() > 1) {
        frameInitial = getLastSeen();
    } else {
        frameInitial = 1;
    }
}

var framediff;
var difftype = "none";

if (vars.framediff) {
    $('#mobilemsg').html("sorry frame diff doesn't work on the mobile site.");
}


$("#LoadingImage").show();

/*
 * Creates array of frame objects.
 */
function getFrameData() {
    $.ajax({
        url: '../getFrameData.php',
        dataType: "json",
        success: function (response) {
            frameData = response;
            frameCount = frameData.length - 1;
            if (frameInitial >= frameCount) {
                frameInitial = frameCount;
            } else if (frameInitial <= 1) {
                frameInitial = 1;
            }
            createSpecialFramesArray();
            
            updateAll(frameInitial);
            $("#LoadingImage").html('');
        },
        error: function () {
            $("#LoadingImage").html('Oh noes, something has gone wrong!');
        }
    });
}
getFrameData();


//If frameData object special is set to 1, add frame to array.
function createSpecialFramesArray() {
    for(i = 1; i < frameCount; i++) {
        if(frameData[i].special == "1") {
            specialFrames.push(i);
        }
    }
    specialFrames.sort(function (a, b) {return a - b;});
}

/*
 * Generic navigation functions.
 */
function firstFrame() {
    updateAll(1);
}

function lastFrame() {
    updateAll(frameCount);
}

//Pass a true value to continue autoplay.
function prevFrame() {
    var nextslideindex = currentFrame - 1;
    nextslideindex = (nextslideindex < 1) ? frameCount : (nextslideindex > frameCount) ? 1 : nextslideindex;
    updateAll(nextslideindex);
}


function nextFrame() {
    var nextslideindex = currentFrame + 1;
    if (nextslideindex > frameCount) {
        nextslideindex = 1;
    }
    updateAll(nextslideindex);
}

function prevSpecialFrame() {
    updateAll(prevSpecial(currentFrame));
}

function nextSpecialFrame() {
    updateAll(nextSpecial(currentFrame));
}


//Updates elements of the page that change as.
function updateAll(frame) {
    var oldframe = currentFrame;
    currentFrame = frame;
    updateLastSeen(frame);
    $('#scrollhere').html('<img src="'+site.slice(0,-6)+'data/frames/'+frame+'.png" alt="Frame: '+frame+'" >');
    $('#framecount input').val(frame);
    $('#totalframes').html(frameCount);
}

//Handlers
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