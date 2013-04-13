/*
 * Makes most of the magic happen, I'm not the greatest coder and I've
 * given credit where it is due.
 */

var images = [];
var imageslen = 0;
var nextslideindex = 1;
var slideshow=document.getElementById("slideshow")
var site = document.URL.substring(0, document.URL.lastIndexOf("/"));
var fps = 1;
var currentFrame = 1;

$("#Loading").show();

$.ajax({
    url: "data.txt",
    dataType: "text",
    success: function(response) {
        $("#LoadingImage").hide();
        //console.log(response);
        images = response.split('\n');
        updateAll(frame);
    },
    error: function() {
        $("#Loading").html('Oh noes, something has gone wrong!');
    }
});

//Allow for mouse wheel scrolling of main event.
//http://www.javascriptkit.com/javatutors/onmousewheel.shtml
function rotateimage(e){
    var evt=window.event || e //equalize event object

    var delta = evt.detail? evt.detail*(-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
    nextslideindex=(delta<=-120)? nextslideindex+1 : nextslideindex-1 //move image index forward or back, depending on whether wheel is scrolled down or up
    nextslideindex=(nextslideindex<1)? images.length-1 : (nextslideindex>images.length-1)? 1 : nextslideindex //wrap image index around when it goes beyond lower and upper boundaries

    updateAll(nextslideindex);

    if (evt.preventDefault) //disable default wheel action of scrolling page
        evt.preventDefault()
    else
        return false
}
var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
if (slideshow.attachEvent) { //if IE (and Opera depending on user setting)
    slideshow.attachEvent("on"+mousewheelevt, rotateimage);
} else if (slideshow.addEventListener) { //WC3 browsers
    slideshow.addEventListener(mousewheelevt, rotateimage, false);
}

//Adds slider and makes it work.
$("#slider").slider({
  slide: function( event, ui ) {
    nextslideindex=$("#slider").slider("value");
    updateAll(nextslideindex);
  }
});

//Allows slider bar to move with mouse wheel (I know it moves opposite of image--eh).
//http://stackoverflow.com/questions/3338364/jquery-unbinding-mousewheel-event-then-rebinding-it-after-actions-are-complete
$('#slider').bind('mousewheel DOMMouseScroll', function (e) {
    var delta = 0, element = $(this), value, result, oe;
    oe = e.originalEvent; // for jQuery >=1.7
    value = element.slider('value');

    if (oe.wheelDelta) {
        delta = -oe.wheelDelta;
    }
    if (oe.detail) {
        delta = oe.detail * 1;
    }

    value -= delta / 120;
    if (value >= imageslen) {
        value = imageslen-1;
    }
    if (value < 1) {
        value = 1;
    }

    result = element.slider('option', 'slide').call(element, e, { value: value });
    if (result !== false) {
        element.slider('value', value);
    }
    return false;
});

//After all ajax loads update the page.
$(document).ajaxComplete(function() {
    imageslen = images.length;
    $("#slider").slider({max:imageslen});
    //$('#speed').html('0 fps');
});



//Autoplay stuff
var speed = 1000;
var timer = $.timer(function() {
    //https://code.google.com/p/jquery-timer/
    updateAll(nextslideindex);
    nextslideindex++;
    if(nextslideindex == imageslen) {
        timer.stop();
        $('#speed').html('0 fps');
    }
});

$('#play').click(function() {
    if($('#play').val() == "Play") {
        $('#play').val("Pause");
        timer.set({ time : speed, autostart : true });
        $('#speed').html(fps.toFixed(2) + ' fps');
    } else {
        $('#play').val("Play");
        timer.stop()
        $('#speed').html('0 fps');
    }
});

$('#fast').click(function() {
    speed -= 100;
    if(speed <= 0){
        speed = 100;
    }
    fps = 1000 / speed;
    timer.set({ time : speed, autostart : true });
    $('#speed').html(fps.toFixed(2) + ' fps');
});

$('#slow').click(function() {
    speed += 100;
    if(speed >= 2000){
        speed = 2000;
    }
    fps = 1000 / speed;
    timer.set({ time : speed, autostart : true });
    $('#speed').html(fps.toFixed(2) + ' fps');
});

$('#previous').click(function() {
    nextslideindex--;
    nextslideindex=(nextslideindex<1)? images.length-1 : (nextslideindex>images.length-1)? 1 : nextslideindex
    updateAll(nextslideindex);
});

$('#next').click(function() {
    if(nextslideindex == images.length-1) {
        nextslideindex = 1;
    } else {
        nextslideindex++;
    }
    updateAll(nextslideindex);
});

//Get's short url from local source if available.
function getBitlyURL(frame){
    $.ajax({
        url: 'bitly.php?frame='+frame,
        dataType: "text",
        success: function(response) {
            $('#link input').val(response);
        },
        error: function() {
            $("#Loading").html('Oh noes, something has gone wrong!');
        }
    });
}

//Change how url is displayed
function displayURL(frame, how) {
    if(how == 'short') {
        getBitlyURL(frame);
    } else if(how == 'long') {
        $('#link input').val(site+'/?frame='+frame);
    }

}

//Immediatly change url when url check box is clicked.
$('#urlCheckBox').click(function() {
    if(!$('#urlCheckBox').is(':checked')) {
        displayURL(currentFrame, 'short');
    } else {
        displayURL(currentFrame, 'long');
    }
});

//Updates elements of the page that change as.
function updateAll(frame) {
    nextslideindex = frame;
    currentFrame = frame;
    slideshow.src = images[frame];
    $("#slider").slider( "value", frame );
    if(!$('#urlCheckBox').is(':checked')) {
        displayURL(frame, 'short');
    } else {
        displayURL(frame, 'long');
    }
}




















