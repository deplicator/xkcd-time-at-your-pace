/*
 * based on http://pastebin.com/cWxA6EDR
 * No idea who to give credit to, but thanks.
 */

var c1 = document.getElementById("canvas1");
var ctx1 = c1.getContext("2d");
var img1 = new Image();

var c2 = document.getElementById("canvas2");
var ctx2 = c2.getContext("2d");
var img2 = new Image();

var c3 = document.getElementById("canvas3");
var ctx3 = c3.getContext("2d");

var img1loaded = false;
var img2loaded = false;

//Note: according to 
//http://stackoverflow.com/questions/1663125/is-javascript-multithreaded 
//i don't have to worry about the two onload-functions to mix up and break 
//everything.
img1.onload = function() {
    ctx1.drawImage(img1,0,0);
    img1loaded = true;
    if(img2loaded) { drawDiffImage(); }
};

img2.onload = function() {
    ctx2.drawImage(img2,0,0);
    img2loaded = true;
    if(img1loaded) { drawDiffImage(); }
};

function drawDiffImage() {
    var data1 = ctx1.getImageData(0, 0, c1.width, c1.height).data;
    var data2 = ctx2.getImageData(0, 0, c2.width, c2.height).data;

    var imageData = ctx3.createImageData(c3.width,c3.height); //So context is not tainted by cross origin ...
    var data3 = imageData.data;

    for(var i = 0, n = data1.length; i < n; i += 4) {
        var color1 = data1[i];
        var color2 = data2[i];

        data3[i] = color1==color2?color1:(color1<color2?0xFF:0x00);
        data3[i+1] = color1==color2?color1:(color1>color2?0xFF:0x00);
        data3[i+2] = color1==color2?color1:0x00;
        data3[i+3] = 0xFF;
    }

    ctx3.putImageData(imageData, 0, 0);
    finishedLoading();
}

/*
 * Difference between two frames, if frame parameter not provided is shows difference from previous frame.
 */
function diff(frame) {
    img1loaded = false
    img2loaded = false
    
    if(!frame) {
        var prevFrame = currentFrame-1;
    } else {
        var prevFrame = frame;
    }
    
    if(prevFrame < 1) {
        img1loaded = true
        ctx1.fillStyle = "white";
        ctx1.fillRect(0,0,c1.width,c1.height);
    } else {
        //In case someone like me wget'ed the data.txt before thinking and now is facing the filename-problem.
        img1.src = ""; //to fix a webkit "bug" -> https://code.google.com/p/chromium/issues/detail?id=7731#c12
        //img1.src = 'images/'+images[prevFrame].replace(/.*\//, '');
        img1.src = 'images/'+prevFrame+'.png';
    }

    img2.src="" // see above
    //img2.src='images/' + images[currentFrame].replace(/.*\//, '');
    img2.src='images/' + currentFrame + '.png';
}













