/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global assert, startLoading,finishedLoading, images, imageslen: false */

var preloadedImages = {};

function getFrameURL(frame) {
    //In case someone like me wget'ed the data.txt before thinking and now is facing the filename-problem.
    //return 'images/' + images[frame].replace(/.*\//, '');
    return 'images/' + frame + '.png';
    //return images[frame];  //Do not use! will break imagediff, because of cross-origin.
}

function predictFrames(frame) {
    var end = Math.min(frame + 5, imageslen);
    var img, i;

    //Preload 5 frames forwards.
    for (i = frame + 1; i <= end; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
            img.src = getFrameURL(i);
            preloadedImages[i] = img;
        }
    }
    //Preload 3 frames backwards.
    for (i = Math.max(frame - 3, 1); i < frame; i++) {
        if (!preloadedImages[i]) {
            img = new Image();
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
            //Setting the onload handler, even if already another handler is present.
            img.onload = function () {
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
        preloadedImages[frame] = new Image();
        preloadedImages[frame].onload = function () {
            if (!doNotSignalFinishLoading) {
                finishedLoading();
            }
            callback(frame, preloadedImages[frame]);
        };
        preloadedImages[frame].src = getFrameURL(frame);
    }
}