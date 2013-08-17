/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global images, frameCount,isSpecial,specialframes, $, currentFrame, changeDiffType: false */
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
var mouseOverOldFrame = 0;
var mouseOverCurrentFrame = 0;
function initPreloadingStatus(maxImages) {
    var i;
    if (preloadingStatusWidth % preloadingStatusRectSize != 0) {
        throw "ERROR: Rect size does not equally divide width";
    }
    preloadingStatusHeight = preloadingStatusRectSize * Math.ceil(maxImages / (preloadingStatusWidth / preloadingStatusRectSize));
    $('#preloadingStatus').attr('height', preloadingStatusHeight);
    preloadingStatusCtx.lineWidth = 1;
    notYetReleasedColor = $("#framedata").css('backgroundColor');
    fetchColors(function() { // callback called when colors successfully fetched
        // Draw the "not yet released" background
        preloadingStatusCtx.fillStyle = notYetReleasedColor;
        preloadingStatusCtx.fillRect(0, 0, preloadingStatusWidth, preloadingStatusHeight);
        // Update all frames
        for (i = 0; i <= maxImages; i++) {
            updatePreloadingIndicator(i);
        }
        preloadingStatus.addEventListener('click', frameMouseClick, false);
        preloadingStatus.addEventListener('mousemove', frameMouseMove, false);
        preloadingStatus.addEventListener('mouseleave', frameMouseMove, false);
        preloadingStatus.addEventListener('mouseout', frameMouseMove, false);
    });
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

/*
 * Fetch the preload indicator colors from the legend SVG.
 *
 * It is possible that the SVG document isn't ready yet. In that case, the function will return false; otherwise, it will return true.
 *
 * Arguments:
 *   - callback: optional: If given, fetchColors will retry on its own if the SVG document isn't ready and call this callback on success; otherwise, it will just return false and thus pass the responsibility to retry to the caller.
 *     The retry occurs asynchronously; i. e., all code that depends on correct execution of this method should be placed in the callback instead of after the method call.
 */
function fetchColors(callback) {
    var legendSvg = document.querySelectorAll("#pli-legend")[0].contentDocument;
    if (legendSvg == null) {
        // SVG document isn't ready yet
        if (callback && callback != null) {
            // try again
            setTimeout(fetchColors, 10);
        }
        return false;
    }
    notYetLoadedColor = legendSvg.querySelectorAll("#fill_notloaded")[0].attributes["fill"].value;
    loadingInProgressColor =  legendSvg.querySelectorAll("#fill_loading")[0].attributes["fill"].value;
    loadingCompleteColor =  legendSvg.querySelectorAll("#fill_loaded")[0].attributes["fill"].value;
    mouseOverFrameBorderColor =  legendSvg.querySelectorAll("#fill_cursor")[0].attributes["fill"].value;
    specialFrameBorderColor =  legendSvg.querySelectorAll("#stroke_special")[0].attributes["stroke"].value;
    debatedFrameBorderColor = legendSvg.querySelectorAll("#stroke_debated")[0].attributes["stroke"].value;
    currentFrameBorderColor =  legendSvg.querySelectorAll("#stroke_current")[0].attributes["stroke"].value;
    currentCompareFrameBorderColor =  legendSvg.querySelectorAll("#stroke_compare")[0].attributes["stroke"].value;
    callback();
    return true;
}

function getFrameURL(frame) {
    //In case someone like me wget'ed the data.txt before thinking and now is facing the filename-problem.
    //return 'frames/' + frames[frame].replace(/.*\//, '');
    if (frame == 1 || diffEngine) {
        return 'data/frames/' + frame + '.png';;
    } else {
        return frameData[frame].link;
    }
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
    var end = Math.min(frame + 5, frameCount);
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

/*
 * Calculates the frame in the preload indicator that corresponds to given mouse coordinates.
 * The coordinates are absolute, i.e. *not* relative to the preload indicator.
 *
 * Returns -1 if the coordinates don't correspond to a frame or the frame number (1-based) otherwise.
 */
function coordinatesToFrame(mouseX, mouseY) {
    var rect = preloadingStatus.getBoundingClientRect();
    var x = mouseX - rect.left - 3; // 3 appears to be the width of the border around the frames
    var y = mouseY - rect.top - 3;

    if (x <= 0
        || x >= preloadingStatusWidth
        || y <= 0
        || y >= preloadingStatusHeight
        ) {
        return -1;
    }

    var ret=( Math.ceil(x / preloadingStatusRectSize)       // dont ask me why it's ceil here
             + (Math.floor(y / preloadingStatusRectSize)    // and floor here, but this works
                * (preloadingStatusWidth / preloadingStatusRectSize)));
    
    // console.log("Mapped "+x+","+y+" to "+ret); // debug code
    return ret;
}

function frameMouseMove(event) {
    var target = event.target || event.srcElement;
    var mouseOverFrame = coordinatesToFrame(event.clientX, event.clientY);
    
    if(mouseOverFrame < 0) {
        var oldFrame = mouseOverOldFrame;
        mouseOverOldFrame = mouseOverCurrentFrame = 0;
        if (oldFrame >= 1 && oldFrame <= frameCount)
            updatePreloadingIndicator(oldFrame);
        return;
    }

    mouseOverCurrentFrame = mouseOverFrame;
    
    if (mouseOverCurrentFrame == mouseOverOldFrame)
        return;

    if (mouseOverOldFrame <= frameCount && mouseOverOldFrame > 0)
        updatePreloadingIndicator(mouseOverOldFrame);

    mouseOverOldFrame = mouseOverCurrentFrame;

    if (mouseOverCurrentFrame <= frameCount && mouseOverCurrentFrame > 0)
        updatePreloadingIndicator(mouseOverCurrentFrame);
}

function frameMouseClick(event) {
    var target = event.target || event.srcElement;
    var mouseOverFrame = coordinatesToFrame(event.clientX, event.clientY);

    mouseOverCurrentFrame = mouseOverFrame;
    if (mouseOverCurrentFrame <= frameCount && mouseOverCurrentFrame > 0) {
        if (event.altKey || event.ctrlKey) {
            //Alt Key modifier => we want to move the compareFrame
            if (mouseOverCurrentFrame == currentFrame) {
                changeDiffType("none", true);
// For now i assume, that if someone alt-clicks the preloadindicator he/she does want to have a freeze-compare.                
//            } else if(mouseOverCurrentFrame == currentFrame - 1) {
//                changeDiffType("prev", true);
            } else {
                changeDiffType("freeze", true);
                $("#freezeframe").val(mouseOverCurrentFrame);
            }
            updateAll(currentFrame);
        } else {
            updateAll(mouseOverCurrentFrame);
        }
    }
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
        if (isDebated(frame)) {
            preloadingStatusCtx.strokeStyle = debatedFrameBorderColor;
        }
        else {
            preloadingStatusCtx.strokeStyle = specialFrameBorderColor;
        }
    }
    else {
        // Neither current nor special frame
        preloadingStatusCtx.strokeStyle = preloadingStatusCtx.fillStyle;
    }
}
