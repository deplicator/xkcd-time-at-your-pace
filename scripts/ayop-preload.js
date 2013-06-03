/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global images, frameCount,isSpecial,specialframes, $, currentFrame: false */
//dependencys: jquery (for ready handler)
// scroll1190.js: images, currentFrame
// ayop-specialframes.js: isSpecial, specialframes
// jquery

var preloadedImages = {};
var preloadingStatus, preloadingStatusCtx;
var preloadingStatusHeight, preloadingStatusWidth = 500;
var preloadingStatusRectSize = 5;
var notYetLoadedColor              = undefined; // These...
var loadingInProgressColor         = undefined;
var loadingCompleteColor           = undefined;
var specialFrameBorderColor        = undefined;
var currentFrameBorderColor        = undefined;
var currentCompareFrameBorderColor = undefined;
var notYetReleasedColor            = undefined;
var mouseOverFrameBorderColor      = undefined;  // will all be set when the GUI is loaded,
var errorColor                     = undefined;  // in fetchColors()
var mouseOverOldFrame = 0;
var mouseOverCurrentFrame = 0;
function initPreloadingStatus(maxImages) {
    var i;
    if (preloadingStatusWidth % preloadingStatusRectSize != 0) {
        throw "ERROR: Rect size does not equally divide width";
    }
    preloadingStatusHeight = preloadingStatusRectSize * Math.floor(maxImages / (preloadingStatusWidth / preloadingStatusRectSize) + 1);
    $('#preloadingStatus').attr('height', preloadingStatusHeight);
    preloadingStatusCtx.lineWidth = 1;
    notYetReleasedColor = $("#framedata").css('backgroundColor');
    fetchColors();
    // Draw the "not yet released" background
    preloadingStatusCtx.fillStyle = notYetReleasedColor;
    preloadingStatusCtx.fillRect(0, 0, preloadingStatusWidth, preloadingStatusHeight);
    // Update all frames
    for (i = 0; i < maxImages; i++) {
        updatePreloadingIndicator(i);
    }
    preloadingStatus.addEventListener('click', frameMouseClick, false);
    preloadingStatus.addEventListener('mousemove', frameMouseMove, false);
    preloadingStatus.addEventListener('mouseleave', frameMouseMove, false);
    preloadingStatus.addEventListener('mouseout', frameMouseMove, false);
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

function fetchColors() {
    var legendSvg = document.querySelectorAll("#pli-legend")[0].contentDocument;
    notYetLoadedColor = legendSvg.querySelectorAll("#fill_notloaded")[0].attributes["fill"].value;
    loadingInProgressColor =  legendSvg.querySelectorAll("#fill_loading")[0].attributes["fill"].value;
    loadingCompleteColor =  legendSvg.querySelectorAll("#fill_loaded")[0].attributes["fill"].value;
    mouseOverFrameBorderColor =  legendSvg.querySelectorAll("#fill_cursor")[0].attributes["fill"].value;
    specialFrameBorderColor =  legendSvg.querySelectorAll("#stroke_special")[0].attributes["stroke"].value;
    currentFrameBorderColor =  legendSvg.querySelectorAll("#stroke_current")[0].attributes["stroke"].value;
    currentCompareFrameBorderColor =  legendSvg.querySelectorAll("#stroke_compare")[0].attributes["stroke"].value;
    errorColor = legendSvg.querySelectorAll("#fill_error")[0].attributes["fill"].value;
    console.log("Not yet loaded color is " + loadingInProgressColor);
}

function getFrameURL(frame) {
    //In case someone like me wget'ed the data.txt before thinking and now is facing the filename-problem.
    //return 'frames/' + frames[frame].replace(/.*\//, '');
    return 'data/frames/' + frame + '.png';
    //return frames[frame];  //Do not use! will break imagediff, because of cross-origin.
}

function preloadingInProgress(frame) {
    updatePreloadingIndicator(frame);
}
function preloadingFinished(frame) {
    updatePreloadingIndicator(frame);
}
function preloadingError(frame) {
    if (frame == currentFrame) {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
    }
    updatePreloadingIndicator(frame);
}

/*
 * Update the Preloading Indicator to show the current status of the frame.
 */
function updatePreloadingIndicator(frame) {
    var frameMinusOne = frame - 1;
    setupContext(frame); // sets preloadingStatusCtx
    preloadingStatusCtx.fillRect(
        (preloadingStatusRectSize * frameMinusOne) % preloadingStatusWidth,
        preloadingStatusRectSize * Math.floor(frameMinusOne / (preloadingStatusWidth / preloadingStatusRectSize)),
        preloadingStatusRectSize,
        preloadingStatusRectSize
    );
    if (preloadingStatusCtx.strokeStyle != preloadingStatusCtx.fillStyle) {
        preloadingStatusCtx.strokeRect(
            (preloadingStatusRectSize * frameMinusOne) % preloadingStatusWidth + 0.5,
            preloadingStatusRectSize * Math.floor(frameMinusOne / (preloadingStatusWidth / preloadingStatusRectSize)) + 0.5,
            preloadingStatusRectSize - 1, //Looks like this draws a rect with size+1
            preloadingStatusRectSize - 1
        );
    }
}

function preloadingFinishedHandlerForFrame(frame) {
    return function () {
        updatePreloadingIndicator(frame);
    };
}
function preloadingErrorHandlerForFrame(frame) {
    return function () {
        preloadedImages[frame] = null;
        updatePreloadingIndicator(frame);
    };
}
function predictFrames(frame) {
    var end = Math.min(frame + 5, frameCount - 1);
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
    for (i = frame - 1; i >= Math.max(frame - 5, 1); i--) {
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
    for (i = 1; i <= frameCount; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.onload = preloadingFinishedHandlerForFrame(i);
            img.onerror = preloadingErrorHandlerForFrame(i);
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
            preloadingInProgress(i);
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
 * this version will not predict any preloading
 */
function preloadOneFrame(frame, callback, doNotSignalFinishLoading) {
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
    return img;
}

/*
 * Same as preloadOneFrame but with prediction
 */
function preloadFrame(frame, callback, doNotSignalFinishLoading) {
    preloadOneFrame(frame, callback, doNotSignalFinishLoading);
    predictFrames(frame);
}

function frameMouseMove(event) {
    target = event.target || event.srcElement;
    x = event.pageX - target.offsetLeft,
    y = event.pageY - target.offsetTop;

    pad_left = parseInt($(target).css('border-width'), 10)
             + parseInt($(target).css('padding-left'), 10)
             + parseInt($(target).css('margin-left'), 10)
             + 1;

    pad_top = parseInt($(target).css('border-width'), 10)
            + parseInt($(target).css('padding-top'), 10)
            + parseInt($(target).css('margin-top'), 10)
            + 1;

    if (x <= pad_left
        || x >= preloadingStatusWidth + pad_left
        || y <= pad_top
        || y >= preloadingStatusHeight + pad_top
        ) {
        updatePreloadingIndicator(mouseOverOldFrame);
        mouseOverOldFrame = 0;
        return;
    }

    mouseOverCurrentFrame = ( Math.floor(x / preloadingStatusRectSize)
              + (Math.floor(y / preloadingStatusRectSize)
                 * (preloadingStatusWidth / preloadingStatusRectSize)
                 - 100));
    
    if (mouseOverCurrentFrame == mouseOverOldFrame)
        return;

    if (mouseOverOldFrame < frameCount && mouseOverOldFrame > 0)
        updatePreloadingIndicator(mouseOverOldFrame);

    mouseOverOldFrame = mouseOverCurrentFrame;

    if (mouseOverCurrentFrame <= frameCount && mouseOverCurrentFrame > 0)
        updatePreloadingIndicator(mouseOverCurrentFrame);
}

function frameMouseClick(event) {
    target = event.target || event.srcElement;
    x = event.pageX - target.offsetLeft,
    y = event.pageY - target.offsetTop;

    mouseOverCurrentFrame = ( Math.floor(x / preloadingStatusRectSize)
              + (Math.floor(y / preloadingStatusRectSize)
                 * (preloadingStatusWidth / preloadingStatusRectSize)
                 - 100));
    if (mouseOverCurrentFrame <= frameCount && mouseOverCurrentFrame > 0)
        updateAll(mouseOverCurrentFrame);
}

// Sets fillStyle and strokeStyle of preloadingStatusCtx for the frame.
// If no stroke should be drawn, strokeStyle is set to fillStyle.
function setupContext(frame) {
    if (typeof frame !== "number") {
        throw "frame has to be a number";
    }
    // Determine frame fill style
    if (mouseOverCurrentFrame === frame) {
        // Current mouseover frame
        preloadingStatusCtx.fillStyle = mouseOverFrameBorderColor;
    }
    else {
        // Not the current mouseover frame, check preload status
        if (preloadedImages[frame]) {
            // Frame has been requested
            img = preloadedImages[frame];
            if (img.naturalWidth === 0 || img.naturalHeight === 0 || img.complete === false) {
                // Frame not yet loaded
                preloadingStatusCtx.fillStyle = loadingInProgressColor;
            }
            else if (img === null) {
                // Error
                preloadingStatusCtx.fillStyle = errorColor;
            }
            else {
                // Frame loaded
                preloadingStatusCtx.fillStyle = loadingCompleteColor;
            }
        }
        else {
            // Frame has not yet been requested
            preloadingStatusCtx.fillStyle = notYetLoadedColor;
        }
    }
    // Determine frame stroke style
    if (currentFrame === frame) {
        // Current frame
        preloadingStatusCtx.strokeStyle = currentFrameBorderColor;
    }
    else if (currentCompareFrame === frame) {
        // Current compare frame
        preloadingStatusCtx.strokeStyle = currentCompareFrameBorderColor;
    }
    else if (isSpecial(frame)) {
        // Not current frame, but special frame
        preloadingStatusCtx.strokeStyle = specialFrameBorderColor;
    }
    else {
        // Neither current nor special frame
        preloadingStatusCtx.strokeStyle = preloadingStatusCtx.fillStyle;
    }
}
