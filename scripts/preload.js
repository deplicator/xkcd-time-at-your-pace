/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global assert, startLoading,finishedLoading, images, imageslen, $: false */

var preloadedImages = {};
var preloadingStatus, preloadingStatusCtx;
var preloadingStatusHeight, preloadingStatusWidth = 500;
var preloadingStatusRectSize = 4;
function initPreloadingStatus(maxImages) {
    if (preloadingStatusWidth % preloadingStatusRectSize != 0) {
        throw "ERROR: Rect size does not equally divide width";
    }
    preloadingStatusHeight = preloadingStatusRectSize * Math.floor(maxImages / (preloadingStatusWidth / preloadingStatusRectSize) + 1);
    $('#preloadingStatus').attr('height', preloadingStatusHeight);
    preloadingStatusCtx.fillStyle = "gray";
    preloadingStatusCtx.fillRect(0, 0, preloadingStatusWidth, preloadingStatusHeight);
    preloadingStatusCtx.fillStyle = "white";
    preloadingStatusCtx.fillRect(
        (preloadingStatusRectSize * maxImages) % preloadingStatusWidth,
        preloadingStatusHeight - preloadingStatusRectSize,
        preloadingStatusWidth -  (preloadingStatusRectSize * maxImages) % preloadingStatusWidth,
        preloadingStatusRectSize
    );
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
    return 'images/' + images[frame].replace(/.*\//, '');
    //return 'images/' + frame + '.png';
    //return images[frame];  //Do not use! will break imagediff, because of cross-origin.
}

function markPreloadingFrame(frame, color) {
    frame = frame - 1;
    preloadingStatusCtx.fillStyle = color;
    preloadingStatusCtx.fillRect(
        (preloadingStatusRectSize * frame) % preloadingStatusWidth,
        preloadingStatusRectSize * Math.floor(frame / (preloadingStatusWidth / preloadingStatusRectSize)),
        preloadingStatusRectSize,
        preloadingStatusRectSize
    );
}

function preloadingInProgress(frame) {
    markPreloadingFrame(frame, "blue");
}
function preloadingFinished(frame) {
    markPreloadingFrame(frame, "black");
}

function preloadingFinishedHandlerForFrame(frame) {
    return function () {
        preloadingFinished(frame);
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
            preloadingInProgress(i);
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
        }
    }
}

function preloadAll() {
    var i;
    for (i = 1; i <= imageslen - 1; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.onload = preloadingFinishedHandlerForFrame(i);
            preloadingInProgress(i);
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
        }
    }
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
    if (preloadedImages[frame]) {
        //Image has already been requested.
        var img = preloadedImages[frame];
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
        } else {
            //Image is already loaded, so we can fire the onLoad handler now.
            callback(frame, img);
        }

    } else {
        //First time this image is requested.
        startLoading(frame);
        preloadingInProgress(frame);
        preloadedImages[frame] = new Image();
        preloadedImages[frame].onload = function () {
            preloadingFinished(frame);
            if (!doNotSignalFinishLoading) {
                finishedLoading();
            }
            callback(frame, preloadedImages[frame]);
        };
        preloadedImages[frame].src = getFrameURL(frame);
    }
    predictFrames(frame);
}