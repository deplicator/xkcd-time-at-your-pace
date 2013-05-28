/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global $, BrowserDetect, ctx3, diff,addWheelListener, preloadFrame, updatePreloadingIndicator, getLastSeen: false */

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
    framediff = parseInt(vars.framediff, 10);
    if (framediff == frameInitial - 1) {
        difftype = "prev";
        $("input[name='difftype'][value='prev']").attr("checked", "checked");
    } else {
        difftype = "freeze";
        $("#freezeframe").prop('disabled', false);
        $("input[name='difftype'][value='freeze']").attr("checked", "checked");
    }
    $("#urlCheckBox").prop('disabled', difftype != "none");
    $('#freezeframe').val(framediff);
} else {
    framediff = 1;
}

$("#LoadingImage").show();

/*
 * The slider has been moved.
*/
slider.oninput = function () {
    var nextslideindex = parseInt(slider.value, 10) || 1; //Yes, that value is a String.
    updateAllWithoutSlider(nextslideindex);
};


/*
 * Creates array of frame objects.
 */
function getFrameData() {
    $.ajax({
        url: 'getFrameData.php',
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
            initPreloadingStatus(frameCount);
            slider.max = frameCount;
            updateAll(frameInitial);
            $("#LoadingImage").html('');
            $('#sfcalcdate').html(new Date(response[0].updatetime).toLocaleString());
        },
        error: function () {
            $("#LoadingImage").html('Oh noes, something has gone wrong!');
        }
    });
}
getFrameData();

/* 
 * Change how url is displayed in "link to this frame" text box.
 * Frame is an int the frame to link to.
 * How is a string for "short" or "long" url.
 * From is optional int to show difference from frame. How string must be
 * "long" to use this parameter.
 */
function displayURL(frame, how, from) {
    if (how == 'short') {
        $('#actuallink').text(frameData[(frame)].blink);
    } else if (how == 'long') {
        if (!from) {
            $('#actuallink').text(site + '/?frame=' + frame);
        } else {
            $('#actuallink').text(site + '/?frame=' + frame + '&framediff=' + from);
        }
    }
}

//Immediatly change url when url check box is clicked.
$('#urlCheckBox').click(function () {
    if (!$('#urlCheckBox').is(':checked')) {
        displayURL(currentFrame, 'short');
    } else {
        displayURL(currentFrame, 'long');
    }
});


$("input[name='difftype']").change(function () {
    difftype = $(this).val();
    $("#freezeframe").prop('disabled', difftype != "freeze");
    //difftype!=none=>freeze or prev selected => we only allow long url
    $("#urlCheckBox").prop('disabled', difftype != "none");
    if (difftype == "freeze") {
        $("#freezeframe").val(currentFrame);
    }
    if (difftype != "none") {
        $('#urlCheckBox').prop('checked', true);
    } else {
        $("#freezeframe").val("");
    }
    updateAll(currentFrame);
});

$("#freezeframe").prop('disabled', difftype != "freeze");

$("#freezeframe").change(function () {
    updateAll(currentFrame);
});

function slideshowLoaded(frame, img) {
    if (currentFrame == frame) {
        ctx3.drawImage(img, 0, 0);
    }
}

//If frameData object special is set to 1, add frame to array.
function createSpecialFramesArray() {
    for(i = 1; i < frameCount; i++) {
        if(frameData[i].special == "1") {
            specialFrames.push(i);
        }
    }
    specialFrames.sort(function (a, b) {return a - b;});
}


//Updates elements of the page that change as.
function updateAllWithoutSlider(frame) {
    var oldframe = currentFrame;
    currentFrame = frame;
    updateLastSeen(frame);

    $('#framecount input').val(frame);
    $('#totalframes').html(frameCount);
    $('#yay').html(frameData[frame].yes);
    $('#nay').html(frameData[frame].no);
    
    //hot debate and make it glow
    $('#debated').addClass('notvisible');
    $('#canvas3').removeClass('special-glow debated-glow');
    if(frameData[frame].no >= 5 && frameData[frame].yes > (frameData[frame].no / 1.9)) {
        $('#debated').removeClass('notvisible');
        $('#canvas3').addClass('debated-glow');
    } else if(isSpecial(frame)) {
        $('#canvas3').addClass('special-glow');
    } else {
        $('#canvas3').addClass('normal-glow');
    }

    if (difftype == "prev") {
        diff();
        displayURL(frame, 'long', frame - 1);
        $('#freezeframe').val(frame - 1);
    } else if (difftype == "freeze") {
        var from = parseInt($('#freezeframe').val(), 10);
        diff(from);
        displayURL(frame, 'long', from);
    } else {
        if (!$('#urlCheckBox').is(':checked')) {
            displayURL(frame, 'short');
        } else {
            displayURL(frame, 'long');
        }
        preloadFrame(frame, slideshowLoaded);
    }
    updatePreloadingIndicator(oldframe);
    updatePreloadingIndicator(currentFrame);
}

function updateAll(frame) {
    slider.value = frame;
    updateAllWithoutSlider(frame);
}