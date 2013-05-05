/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true, maxerr: 100, regexp: true */
/*global $, BrowserDetect, ctx3, diff,addWheelListener, preloadFrame: false */

//Fix console.log for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () {};
}

/*
 * Makes most of the magic happen, I'm not the greatest coder and I've tried to
 * give credit where it is due.
 */

var specialframes = [52, 170, 175, 320, 403, 408, 414, 486, 487, 488, 490, 562, 563, 564, 637, 638,
                     640, 641, 642, 659, 660, 661, 832, 833, 834, 835, 838, 839, 855, 856, 857, 859,
                     860, 861, 862, 864, 865, 985, 1004, 1006, 1018, 1024, 1025, 1041, 1042, 1044, 
                     1045, 1049, 1050, 1052, 1053, 1066, 1067, 1069, 1071, 1072, 1073, 1093, 1096];
var images = [];
var bitlydata = null;
var imageslen = 0;
var scrollhere = document.getElementById("scrollhere");
var slider = document.getElementById("slider");
var site = document.URL.substring(0, document.URL.lastIndexOf("/"));
var fps = 1;
var currentFrame = 1;
var initialframe;


function lastSeen() {
    var i, m;
    var cookies = document.cookie.split(';');
    for (i = 0; i < cookies.length; ++i) {
        m = cookies[i].match(/^lastSeen=(.*)/);
        if (m) {
            return parseInt(m[1], 10);
        }
    }
    return 0;
}
if (lastSeen() > 1) {
    $('#lastSeen').show();
}

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
    if (lastSeen() > 1) {
        initialframe = lastSeen();
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
 * Add the special-frames to the html
 */
var sflen = specialframes.length;
for (var i = 0; i < sflen; i++) {
    $('#textframelist').append('<li><a href="./?frame='+specialframes[i]+'"><img src="./images/'+specialframes[i]+'.png" alt=""></a></li>');
}

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
        slider.max = images.length - 1;
        imageslen = images.length;
        if (initialframe >= imageslen) {
            initialframe = imageslen - 1;
        } else if (initialframe <= 1) {
            initialframe = 1;
        }
        initPreloadingStatus(imageslen-1);
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

// Thanks to jfriend00 on http://stackoverflow.com/questions/10264239/fastest-way-to-determine-if-an-element-is-in-a-sorted-array
function binary_search_iterative(a, value) {
    var lo = 0, hi = a.length - 1, mid;
    while (lo <= hi) {
        mid = Math.floor((lo+hi)/2);
        if (a[mid] > value)
            hi = mid - 1;
        else if (a[mid] < value)
            lo = mid + 1;
        else
            return mid;
    }
    return null;
}

function isSpecial(frame) {
    return binary_search_iterative(specialframes,frame) != null;
}

//Autoplay stuff
var specialframecounter = 0;
var speed = 1000;

//https://code.google.com/p/jquery-timer/
var timer = $.timer(function() {
    if(isSpecial(currentFrame)) {
        specialframecounter+=speed;
        if(specialframecounter < (parseInt($('#PauseSpecialFrameAmount').val(),10) || 0)*1000) {
            return;//should pause x seconds... 
        }
        else {
            specialframecounter=0;
        }
    }
    currentFrame++;
    updateAll(currentFrame);
    if (currentFrame >= (imageslen-1)) {
        timer.stop();
        $('#play').val("Play");
        $('#speed').html('0 fps');
    }
});

$('#play').click(function () {
    if ($('#play').val() == "Play") {
        $('#play').val("Pause");
        if (currentFrame >= (imageslen - 1)) {
            updateAll(1);
        }
        timer.set({ time : speed, autostart : true });
        $('#speed').html(fps.toFixed(2) + ' fps');
    } else {
        $('#play').val("Play");
        timer.stop();
        $('#speed').html('0 fps');
    }
});

$('#fast').click(function () {
    speed -= 100;
    if (speed <= 0) {
        speed = 100;
    }
    fps = 1000 / speed;
    timer.set({ time : speed, autostart : true });
    $('#speed').html(fps.toFixed(2) + ' fps');
});

$('#slow').click(function () {
    speed += 100;
    if (speed >= 2000) {
        speed = 2000;
    }
    fps = 1000 / speed;
    timer.set({ time : speed, autostart : true });
    $('#speed').html(fps.toFixed(2) + ' fps');
});

function prevSlide() {
    var nextslideindex = currentFrame - 1;
    nextslideindex = (nextslideindex < 1) ? images.length - 1 : (nextslideindex > images.length - 1) ? 1 : nextslideindex;
    updateAll(nextslideindex);
}
$('#previous').click(prevSlide);

function nextSlide() {
    var nextslideindex = currentFrame + 1;
    if (nextslideindex >= images.length) {
        nextslideindex = 1;
    }
    updateAll(nextslideindex);
}
$('#next').click(nextSlide);

$(document).keydown(function (e) {
    if (e.which == 37) { //left-key-pressed
        prevSlide();
    } else if (e.which == 39) { //right-key-pressed
        nextSlide();
    }
});

function scrollHandler(e) {
    //Delta was allways = 3 in my tests with Firefox and Chrome. 
    //Maybe we can use it to determine the speed, but for now we only scroll one frame.
    var delta = e.deltaY != 0 ? e.deltaY : (e.deltaX != 0 ? e.deltaX : 0);
    if (delta < 0) { //Up or left-Scroll
        prevSlide();
    } else if (delta > 0) { //Down or Right-Scroll
        nextSlide();
    }
    e.preventDefault();
}
/*
 * Attach same Handler to slider and image
 */
addWheelListener(slider, scrollHandler);
addWheelListener(scrollhere, scrollHandler);

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

$('#lastSeen').click(function () {
    updateAll(lastSeen());
});

function startLoading(frame) {
    $("#LoadingIndicator").show();
}

function finishedLoading() {
    $("#LoadingIndicator").hide();
}

function slideshowLoaded(frame, img) {
    if (currentFrame == frame) {
        ctx3.drawImage(img, 0, 0);
    }
}

//Updates elements of the page that change as.
function updateAllWithoutSlider(frame) {
    currentFrame = frame;
    //startLoading(frame);

    if (frame > lastSeen()) {
        var expire = new Date();
        expire.setFullYear(expire.getFullYear() + 1);
        document.cookie = 'lastSeen=' + frame + '; expires=' + expire.toGMTString();
    }

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
}

function updateAll(frame) {
    slider.value = frame;
    updateAllWithoutSlider(frame);
}

// Show and hide frames with text, can be moved to a ui only file
$('#textframes h3').click(function () {
    $('#textframes ul').slideToggle('slow');
});



