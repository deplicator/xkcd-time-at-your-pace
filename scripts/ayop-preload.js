/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global images, imageslen,isSpecial,specialframes, $, currentFrame: false */
//dependencys: jquery (for ready handler)
// scroll1190.js: images, currentFrame
// ayop-specialframes.js: isSpecial, specialframes
// jquery

var preloadedImages = {};
var preloadingStatus, preloadingStatusCtx;
var preloadingStatusHeight, preloadingStatusWidth = 500;
var preloadingStatusRectSize = 5;
var notYetLoadedColor       = "#808080";
var loadingInProgressColor  = "#6082B6";
var loadingCompleteColor    = "#222";
var specialFrameBorderColor = "#FFFF00";
var currentFrameBorderColor = "#00FF00";
var mouseOverFrameBorderColor = "#0000FF";
var mouseOverOldFrame = 0;
function initPreloadingStatus(maxImages) {
    var i;
    if (preloadingStatusWidth % preloadingStatusRectSize != 0) {
        throw "ERROR: Rect size does not equally divide width";
    }
    preloadingStatusHeight = preloadingStatusRectSize * Math.floor(maxImages / (preloadingStatusWidth / preloadingStatusRectSize) + 1);
    $('#preloadingStatus').attr('height', preloadingStatusHeight);
    preloadingStatusCtx.lineWidth = 1;
    preloadingStatusCtx.fillStyle = notYetLoadedColor;
    preloadingStatusCtx.fillRect(0, 0, preloadingStatusWidth, preloadingStatusHeight);
    preloadingStatusCtx.fillStyle = $("#funstuff").css('backgroundColor');
    preloadingStatusCtx.fillRect(
        (preloadingStatusRectSize * maxImages) % preloadingStatusWidth,
        preloadingStatusHeight - preloadingStatusRectSize,
        preloadingStatusWidth -  (preloadingStatusRectSize * maxImages) % preloadingStatusWidth,
        preloadingStatusRectSize
    );
    for (i = 0; i < specialframes.length; i++) {
        markPreloadingFrame(specialframes[i], notYetLoadedColor);
    }
    preloadingStatus.addEventListener('click', frameMouseClick, false);
    preloadingStatus.addEventListener('mousemove', frameMouseMove, false);
}
$(document).ready(function () {
    preloadingStatus = document.getElementById("preloadingStatus");
    preloadingStatusCtx = preloadingStatus.getContext("2d");
    $("#preloadAllButton").click(function () {
        if ($(this).val() == "Sure?!") {
            setTimeout(preloadAll, 0);
            $(this).hide();
        } else {
            $(this).val("Sure?!");
        }
    });
});


function getFrameURL(frame) {
    //In case someone like me wget'ed the data.txt before thinking and now is facing the filename-problem.
    //return 'images/' + images[frame].replace(/.*\//, '');
    return 'images/' + frame + '.png';
    //return images[frame];  //Do not use! will break imagediff, because of cross-origin.
}

function markPreloadingFrame(frame, color) {
    var frameMinusOne = frame - 1;
    preloadingStatusCtx.fillStyle = color;
    preloadingStatusCtx.fillRect(
        (preloadingStatusRectSize * frameMinusOne) % preloadingStatusWidth,
        preloadingStatusRectSize * Math.floor(frameMinusOne / (preloadingStatusWidth / preloadingStatusRectSize)),
        preloadingStatusRectSize,
        preloadingStatusRectSize
    );

    if (isSpecial(frame) || currentFrame === frame) {
        preloadingStatusCtx.strokeStyle = currentFrame === frame ? currentFrameBorderColor : specialFrameBorderColor;
        preloadingStatusCtx.strokeRect(
            (preloadingStatusRectSize * frameMinusOne) % preloadingStatusWidth + 0.5,
            preloadingStatusRectSize * Math.floor(frameMinusOne / (preloadingStatusWidth / preloadingStatusRectSize)) + 0.5,
            preloadingStatusRectSize - 1, //Looks like this draws a rect with size+1
            preloadingStatusRectSize - 1
        );
    }
}

function preloadingInProgress(frame) {
    markPreloadingFrame(frame, loadingInProgressColor);
}
function preloadingFinished(frame) {
    markPreloadingFrame(frame, loadingCompleteColor);
}
function preloadingError(frame) {
    if (frame == currentFrame) {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
    }
    markPreloadingFrame(frame, "red");
}

/*
 * Update the Preloading Indicator to show the current status of the frame.
 */
function updatePreloadingIndicator(frame) {
    if (preloadedImages[frame]) {
        var img = preloadedImages[frame];
        if (img.naturalWidth === 0 || img.naturalHeight === 0 || img.complete === false) {
            //Image is still loading
            preloadingInProgress(frame);
        } else {
            //Image is complete.
            preloadingFinished(frame);
        }
    } else {
        //Image has not yet been marked for preloading
        markPreloadingFrame(frame, notYetLoadedColor);
    }
}

function preloadingFinishedHandlerForFrame(frame) {
    return function () {
        preloadingFinished(frame);
    };
}
function preloadingErrorHandlerForFrame(frame) {
    return function () {
        preloadedImages[frame] = null;
    };
}
function predictFrames(frame) {
    var end = Math.min(frame + 5, imageslen - 1);
    var img, i;

    //Preload 5 frames forwards.
    for (i = frame + 1; i <= end; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.onload = preloadingFinishedHandlerForFrame(i);
            img.onerror = preloadingErrorHandlerForFrame(i);
            preloadingInProgress(i);
            img.src = getFrameURL(i);

            preloadedImages[i] = img;
        }
    }
    //Preload 3 frames backwards.
    for (i = frame - 1; i >= Math.max(frame - 3, 1); i--) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.onload = preloadingFinishedHandlerForFrame(i);
            img.onerror = preloadingErrorHandlerForFrame(i);
            preloadingInProgress(i);
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
        }
    }
}

function preloadAll() {
    var i, img;
    for (i = 1; i <= imageslen - 1; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.onload = preloadingFinishedHandlerForFrame(i);
            img.onerror = preloadingErrorHandlerForFrame(i);
            preloadingInProgress(i);
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
        }
    }
}

function startLoading(frame) {
    $("#loading").show();
}

function finishedLoading() {
    $("#loading").hide();
}

/*
 * Method to be called, when the specified frame is requested to be shown NOW.
 * Will predict the next images and preload them also.
 * callback(frameNumber, Image-Object) will be called when the image is loaded.
 * Also this uses startLoading() and finishedLoading() to show the loading
 * indicator.
 * if doNotSignalFinishLoading is false it will not mark the loading as finished.
 */
function preloadFrame(frame, callback, doNotSignalFinishLoading) {
    if (typeof frame !== "number") {
        throw "frame has to be a number";
    }
    var img;
    if (preloadedImages[frame]) {
        //Image has already been requested.
        img = preloadedImages[frame];
        if (img.naturalWidth === 0 || img.naturalHeight === 0 || img.complete === false) {
            //Image is still loading -> http://stackoverflow.com/questions/821516/browser-independent-way-to-detect-when-image-has-been-loaded
            startLoading(frame); //Show loading indicator.
            preloadingInProgress(frame);
            //Setting the onload handler, even if already another handler is present.
            img.onload = function () {
                preloadingFinished(frame);
                if (!doNotSignalFinishLoading) {
                    finishedLoading();
                }
                callback(frame, img);
            };
            img.onerror = preloadingErrorHandlerForFrame(frame);
        } else {
            //Image is already loaded, so we can fire the onLoad handler now.
            callback(frame, img);
        }

    } else {
        //First time this image is requested.
        startLoading(frame);
        preloadingInProgress(frame);
        img = new Image();
        img = new Image();
        img.onload = function () {
            preloadingFinished(frame);
            if (!doNotSignalFinishLoading) {
                finishedLoading();
            }
            callback(frame, preloadedImages[frame]);
        };
        img.onerror = preloadingErrorHandlerForFrame(frame);
        img.src = getFrameURL(frame);
        preloadedImages[frame] = img;
    }
    predictFrames(frame);
}

function frameMouseMove(event) {
    x = event.pageX - event.srcElement.offsetLeft,
    y = event.pageY - event.srcElement.offsetTop;

    frame = ( Math.floor(x / preloadingStatusRectSize)
              + (Math.floor(y / preloadingStatusRectSize)
                 * (preloadingStatusWidth / preloadingStatusRectSize)
                 - 100));

    if (frame == mouseOverOldFrame)
        return;

    updatePreloadingIndicator(mouseOverOldFrame);

    mouseOverOldFrame = frame;

    markPreloadingFrame(frame, mouseOverFrameBorderColor);
}

function frameMouseClick(event) {
    x = event.pageX - event.srcElement.offsetLeft,
    y = event.pageY - event.srcElement.offsetTop;

    frame = ( Math.floor(x / preloadingStatusRectSize)
              + (Math.floor(y / preloadingStatusRectSize)
                 * (preloadingStatusWidth / preloadingStatusRectSize)
                 - 100));

    updateAll(frame);
}
