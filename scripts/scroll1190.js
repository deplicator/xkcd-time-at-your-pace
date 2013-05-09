/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global $, BrowserDetect, ctx3, diff,addWheelListener, preloadFrame, updatePreloadingIndicator, getLastSeen: false */

//Fix console.log for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () {};
}

/*
 * Makes most of the magic happen, I'm not the greatest coder and I've tried to
 * give credit where it is due.
 */

var images = [];
var bitlydata = null;
var imageslen = 0; //replacing imageslen with framecount
var framecount = 0; //were we calling it framecount or imagecount?
var scrollhere = document.getElementById("scrollhere");
var slider = document.getElementById("slider");
var site = document.URL.substring(0, document.URL.lastIndexOf("/"));
var currentFrame = 1;
var initialframe;



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
if (vars.frame) {
    initialframe = parseInt(vars.frame, 10);
} else {
    if (getLastSeen() > 1) {
        initialframe = getLastSeen();
    } else {
        initialframe = 1;
    }
}

var framediff;
var difftype = "none";

if (vars.framediff) {
    framediff = parseInt(vars.framediff, 10);
    if (framediff == initialframe - 1) {
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
 * Loaded data.txt 
 * Now we know how many images exists and can check the selected initialframe.
 */
$.ajax({
    url: "data.txt",
    dataType: "text",
    success: function (response) {
        $("#LoadingImage").html('');
        //console.log(response);
        images = response.split('\n');
        imageslen = images.length;
        framecount = imageslen - 1;
        slider.max = framecount;
        if (initialframe >= imageslen) {
            initialframe = framecount;
        } else if (initialframe <= 1) {
            initialframe = 1;
        }
        initPreloadingStatus(framecount);
        updateAll(initialframe);
    },
    error: function () {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
    }
});

$.ajax({
    url: "bitlydata.txt",
    daa: "text",
    success: function (response) {
        bitlydata = {};
        var bitlylinks = response.split('\n'), breakitup, i;
        for (i = bitlylinks.length - 1; i >= 0; i--) {
            breakitup = bitlylinks[i].split(" ");
            bitlydata[parseInt(breakitup[0], 10) || -1] = breakitup[1];
        }
        $('#link input').val(bitlydata[currentFrame]);
    },
    error: function () {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
    }

});


/* 
 * Get's short url from local source if available.
 * It should be noted the bitly links used here all go to geekwagon.net. Something to keep in mind
 * if anyone sets this up on another domain.
 */
function getBitlyURL(frame) {
    if (!bitlydata) {
        $('#link input').val("Not yet loaded bitlydata.");
        return;
    }

    if (frame > imageslen) {
        frame = imageslen;
    } else if (frame <= 1) {
        frame = 1;
    }
    if (bitlydata[frame]) {
        $('#link input').val(bitlydata[frame]);
    } else {
        $.ajax({
            url: 'bitly.php?frame=' + frame,
            dataType: "text",
            success: function (response) {
                $('#link input').val(response);
            },
            error: function () {
                $("#LoadingImage").html('Oh noes, something has gone wrong!');
            }
        });
    }
}

/* 
 * Change how url is displayed in "link to this frame" text box.
 * Frame is an int the frame to link to.
 * How is a string for "short" or "long" url.
 * From is optional int to show difference from frame. How string must be
 * "long" to use this parameter.
 */
function displayURL(frame, how, from) {
    if (how == 'short') {
        getBitlyURL(frame);
    } else if (how == 'long') {
        if (!from) {
            $('#link input').val(site + '/?frame=' + frame);
        } else {
            $('#link input').val(site + '/?frame=' + frame + '&framediff=' + from);
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

//Updates elements of the page that change as.
function updateAllWithoutSlider(frame) {
    var oldframe = currentFrame;
    currentFrame = frame;
    //startLoading(frame);
    updateLastSeen(frame);

    $('#frameNum').html('frame: ' + frame + ' / ' + (imageslen - 1));

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