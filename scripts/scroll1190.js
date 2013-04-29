/*
 * Makes most of the magic happen, I'm not the greatest coder and I've tried to
 * give credit where it is due.
 */

var images = [];
var bitlydata = null;
var imageslen = 0;
var nextslideindex = 1;
var scrollhere=document.getElementById("scrollhere")
var slideshow=document.getElementById("slideshow")
var slider = document.getElementById("slider")
var site = document.URL.substring(0, document.URL.lastIndexOf("/"));
var fps = 1;
var currentFrame = 1;

//From: http://jquery-howto.blogspot.de/2009/09/get-url-parameters-values-with-jquery.html
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
var vars = getUrlVars();
var frame;
if(vars.frame) {
    frame = parseInt(vars.frame);
} else {
    frame = 1;
}
var framediff;
if(vars.framediff) {
    framediff = parseInt(vars.framediff);
    $('#showFrameDiff').prop('checked', true);
    $('#freezeframe').val(framediff);
    $('#slideshow').addClass('hidden');
    $('#canvas3').removeClass('hidden');
    updateAll(frame);
} else {
    framediff = 1;
}

$("#LoadingImage").show();

/*
 * Browser detect http://www.quirksmode.org/js/detect.html
 * There is more here than needed, but it might be useful someday.
 * It is currently only used to detect Firefox and load a jQueryUI slider.
 */
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};
BrowserDetect.init();


if(BrowserDetect.browser == "Firefox") {
    $.getScript('./scripts/jquery-ui-1.10.2.custom.min.js', function() {
        $('#slider').addClass('hidden');
        $('#ffslider').removeClass('hidden');
        
        $("#ffslider").slider({
            slide: function( event, ui ) {
                nextslideindex=$("#ffslider").slider("value");
                updateAll(nextslideindex);
            }
        });
    });
    $(document).ajaxComplete(function() {
    if(frame > imageslen) {
            frame = imageslen;
        } else if(frame <= 1) {
            frame = 1;
        }
    $("#ffslider").slider({max:imageslen});
});

} else {
    slider.onchange=function() {
        nextslideindex=parseInt(slider.value) || 1 //Yes, that value is a String.
        updateAll(nextslideindex)
    }
}

$(function() {
    if (lastSeen() > 1) {
        $('#lastSeen').show();
    }
});

$.ajax({
    url: "data.txt",
    dataType: "text",
    success: function(response) {
        $("#LoadingImage").html('');
        //console.log(response);
        images = response.split('\n');
        slider.max=images.length-1
        imageslen = images.length;
        if(frame >= imageslen) {
                frame = imageslen-1;
            } else if(frame <= 1) {
                frame = 1;
            }
        
        updateAll(frame);
    },
    error: function() {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
    }
});

$.ajax({
    url: "bitlydata.txt",
    daa: "text",
    success: function(response) {
        bitlydata={};
        var bitlylinks=response.split('\n');
        var breakitup;
        for (var i = bitlylinks.length - 1; i >= 0; i--) {
            breakitup=bitlylinks[i].split(" ");
            bitlydata[parseInt(breakitup[0])||-1]=breakitup[1];
        };
         $('#link input').val(bitlydata[currentFrame]);
    },
    error: function() {
        $("#LoadingImage").html('Oh noes, something has gone wrong!');
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
if (scrollhere.attachEvent) { //if IE (and Opera depending on user setting)
    scrollhere.attachEvent("on"+mousewheelevt, rotateimage);
} else if (scrollhere.addEventListener) { //WC3 browsers
    scrollhere.addEventListener(mousewheelevt, rotateimage, false);
}


/*
 * Allows slider bar to move with mouse wheel.
 * http://stackoverflow.com/questions/3338364/jquery-unbinding-mousewheel-event-then-rebinding-it-after-actions-are-complete
 * 
 */
if(BrowserDetect.browser != "Firefox") {
    $('#slider').bind('mousewheel DOMMouseScroll', function (e) {
        var delta = 0, element = $(this), value, result, oe;
        oe = e.originalEvent; // for jQuery >=1.7
        value = slider.value;

        if (oe.wheelDelta) {
            delta = oe.wheelDelta; //Now it moves the same as the image scroll because this value is not negative.
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

        if(value!=slider.value)
            updateAll(value) //Will update slider
        if (e.preventDefault) //disable default wheel action of scrolling page
            e.preventDefault()
        else
            return false
    });
} else {
    console.log('I\'m growing a dislike for FF');
    //do something here later, for now FF users can live without scrolling over the slider.
}


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
    speed -= 200;
    if(speed <= 0){
        speed = 100;
    }
    fps = 1000 / speed;
    timer.set({ time : speed, autostart : true });
    $('#speed').html(fps.toFixed(2) + ' fps');
});

$('#slow').click(function() {
    speed += 200;
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


/* 
 * Get's short url from local source if available.
 * It should be noted the bitly links used here all go to geekwagon.net. Something to keep in mind
 * if anyone sets this up on another domain.
 */
function getBitlyURL(frame){
    if(!bitlydata)
    {
         $('#link input').val("Not yet loaded bitlydata.");
         return;
     }

    if(frame > imageslen) {
        frame = imageslen;
    } else if(frame <= 1) {
        frame = 1;
    }
    if(bitlydata[frame])
        $('#link input').val(bitlydata[frame]);
    else
    {
        $.ajax({
            url: 'bitly.php?frame='+frame,
            dataType: "text",
            success: function(response) {
                $('#link input').val(response);
            },
            error: function() {
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
    if(how == 'short') {
        getBitlyURL(frame);
    } else if(how == 'long') {
        if(!from) {
            $('#link input').val(site+'/?frame='+frame);
        } else {
            $('#link input').val(site+'/?frame='+frame+'&framediff='+from);
        }
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

//Clicking on showdiff check box.
$('#showDiff').click(function() {
    if($('#showDiff').is(':checked')) {
        $('#showFrameDiff').prop('checked', false);
        $('#slideshow').addClass('hidden');
        $('#canvas3').removeClass('hidden');
        $('#showlong').addClass('hidden');
        $('#actuallink').attr("size", "65")
    } else {
        $('#slideshow').removeClass('hidden');
        $('#canvas3').addClass('hidden');
        $('#showlong').removeClass('hidden');
        $('#actuallink').attr("size", "50")
    }
    updateAll(currentFrame)
});

//Image Diffrence from frame checkbox
$('#showFrameDiff').click(function() {
    if($('#showFrameDiff').is(':checked')) {
        $('#showDiff').prop('checked', false);
        $('#freezeframe').val(currentFrame);
        $('#slideshow').addClass('hidden');
        $('#canvas3').removeClass('hidden');
        $('#showlong').addClass('hidden');
        $('#actuallink').attr("size", "65")
    } else {
        $('#slideshow').removeClass('hidden');
        $('#canvas3').addClass('hidden');
        $('#showlong').removeClass('hidden');
        $('#actuallink').attr("size", "50")
    }
    updateAll(currentFrame)
});

$('#lastSeen').click(function() {
    updateAll(lastSeen());
});

function lastSeen() {
    var i, m;
    var cookies = document.cookie.split(';');
    for( var i=0; i < cookies.length; ++i ) {
        var m = cookies[i].match( /^lastSeen=(.*)/ );
        if(m) return m[1];
    }

    return 0;
}
function startLoading(frame) {
    $("#LoadingIndicator").show();
}

function finishedLoading() {
    $("#LoadingIndicator").hide();
}
slideshow.onload=finishedLoading;
//Updates elements of the page that change as.
function updateAll(frame) {
    currentFrame = frame;
    startLoading(frame)
    nextslideindex = frame;
    if(!$('#showFrameDiff').is(':checked') && !$('#showDiff').is(':checked'))
    {
        slideshow.src="";
        slideshow.src = images[frame];
    }
    slider.value=frame;

    if( frame > lastSeen() ) {
        var expire = new Date();
        expire.setFullYear( expire.getFullYear() + 1 );
        document.cookie = 'lastSeen=' + frame + '; expires=' + expire.toGMTString();
    }

    $('#frameNum').html('frame: ' + frame + ' / ' + (imageslen - 1));
    if(!$('#urlCheckBox').is(':checked')) {
        displayURL(frame, 'short');
    } else {
        displayURL(frame, 'long');
    }
    if($('#showDiff').is(':checked')) {
        diff();
        displayURL(frame, 'long', frame-1);
    }
    if($('#showFrameDiff').is(':checked')) {
        var from = $('#freezeframe').val();
        diff(from);
        displayURL(frame, 'long', from);
    }
}




















