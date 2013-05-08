/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true */
/*global finishedLoading, currentFrame, preloadFrame: false */
/*
 * based on http://pastebin.com/cWxA6EDR
 * No idea who to give credit to, but thanks.
 */

var c1 = document.getElementById("canvas1");
var ctx1 = c1.getContext("2d");

var c2 = document.getElementById("canvas2");
var ctx2 = c2.getContext("2d");

var c3 = document.getElementById("canvas3");
var ctx3 = c3.getContext("2d");

var img1loaded = false;
var img2loaded = false;

function drawDiffImage() {
    var i, n;
    var data1 = ctx1.getImageData(0, 0, c1.width, c1.height).data;
    var data2 = ctx2.getImageData(0, 0, c2.width, c2.height).data;

    var imageData = ctx3.createImageData(c3.width, c3.height); //So context is not tainted by cross origin ...
    var data3 = imageData.data;

    for (i = 0, n = data1.length; i < n; i += 4) {
        var color2 = data1[i];
        var color1 = data2[i];

        //TODO: Fix for Grey Images
        data3[i]     = color1 == color2 ? color1 : (color1 < color2 ? 0xFF : 0x00);
        data3[i + 1] = color1 == color2 ? color1 : (color1 > color2 ? 0xFF : 0x00);
        data3[i + 2] = color1 == color2 ? color1 : 0x00;
        data3[i + 3] = 0xFF;
    }

    ctx3.putImageData(imageData, 0, 0);
    finishedLoading();
}


var compareFrame;
function image2preloaded(frame, img) {
    if (compareFrame == frame) {
        ctx2.drawImage(img, 0, 0);
        img2loaded = true;
        if (img1loaded) {
            finishedLoading();
            drawDiffImage();
        }
    }
}
function image1preloaded(frame, img) {
    if (currentFrame == frame) {
        ctx1.drawImage(img, 0, 0);
        img1loaded = true;
        if (img2loaded) {
            finishedLoading();
            drawDiffImage();
        }
    }
}


/*
 * Difference between two frames, if frame parameter not provided is shows difference from previous frame.
 */
function diff(frame) {
    img1loaded = false;
    img2loaded = false;
    if (!frame) {
        compareFrame = currentFrame - 1;
    } else {
        compareFrame = frame;
    }

    if (compareFrame < 1) {
        img1loaded = true;
        ctx1.fillStyle = "white";
        ctx1.fillRect(0, 0, c1.width, c1.height);
    } else {
        preloadFrame(compareFrame, image2preloaded, false);
    }

    preloadFrame(currentFrame, image1preloaded, false);
}













