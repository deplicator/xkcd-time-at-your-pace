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
var currentCompareFrame = 0;
var specialFrames = [];
var diffEngine = false;

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
$("#diffEngineControls").hide();
if (vars.framediff) {
    diffEngine = true;
    $("#turnOnDiffEngine").hide();
    $("#diffEngineControls").show();
    framediff = parseInt(vars.framediff, 10);
    if (framediff == frameInitial - 1) {
        changeDiffType("prev", true);
    } else {
        changeDiffType("freeze", true);
    }
    $('#freezeframe').val(framediff);
} else {
    changeDiffType("none", true);
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
    $.getJSON("data/frame-details.json", function(json) {
        frameData = json;
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
        $('#sfcalcdate')
            .html(new Date(json[0].updatetime).toLocaleString())
            .attr('title', "Original Timestamp: " + json[0].updatetime);
    });
}
$(function(){ getFrameData(); });

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

function changeDiffType(newdifftype, updateRadioButtons) {
    if (['none', 'freeze', 'prev'].indexOf(newdifftype) < 0) { //Array does not contain
        throw "Wrong difftype";
    }
    difftype = newdifftype;
    $("#freezeframe").prop('disabled', newdifftype != "freeze");
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
    if (updateRadioButtons) {
        $("input[name='difftype'][value='" + difftype + "']").attr("checked", "checked");
    }
}
$("input[name='difftype']").change(function () {
    changeDiffType($(this).val());
    updateAll(currentFrame);
});

$("#freezeframe").prop('disabled', difftype != "freeze");

$("#freezeframe").change(function () {
    updateAll(currentFrame);
});


/*
 * Adds a CSS stylesheet to a document.
 *
 * - someDocument: typically document or someElement.contentDocument
 * - filename: filename of the stylesheet
 * - parent: type of parent element, typically head for HTML documents or defs for SVG documents
 */
function addCss(someDocument, filename, parent) {
    var fileref = someDocument.createElementNS("http://www.w3.org/1999/xhtml","link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    someDocument.getElementsByTagName(parent)[0].appendChild(fileref);
}

/*
 * Removes a CSS stylesheet from a document.
 *
 * - someDocument: typically document or someElement.contentDocument
 * - filename: exact filename of the stylesheet
 * - parent: optional: type of parent element, speeds up search of elements when used
 */
function removeCss(someDocument, filename, parent) {
    var elements;
    if (parent == null || parent == undefined) {
        elements = [someDocument];
    }
    else {
        elements = someDocument.getElementsByTagName(parent);
    }
    for (var i = 0; i < elements.length; i++) {
        var allLinks = elements[i].getElementsByTagName("link");
        for (var j = allLinks.length - 1; j >= 0; j--) {
            var currentLink = allLinks[j];
            if (currentLink && currentLink.getAttribute("href") == filename) {
                currentLink.parentNode.removeChild(currentLink);
            }
        }
    }
}

/*
 * Handler for the "themes" checkboxes.
 *
 * One handler fits all, as long as the following rules are followed:
 *   - The checkbox should be an input inside a label inside the #themes div
 *   - Its value should be the name of the stylesheet (without "css/" prefix)
 * If these rules are followed, then additional themes can be added without even changing this file!
 *
 * Arguments:
 *   - filename: The filename of the css stylesheet to toggle.
 *   - enable: true to enable the stylesheet, false to disable it.
 */
function toggleTheme(filename, enable) {
    if (enable) {
        // add CSS to index.html
        addCss(document, filename, "head");
        // add CSS to ayop-logo.svg
        var svgDocument = document.getElementById("ayop_logo").contentDocument;
        if (svgDocument == null) {
            // SVG document isn't ready yet, try again
            setTimeout(function () { toggleTheme(filename, enable); }, 10);
            return;
        }
        addCss(svgDocument, "../" + filename, "defs");
    } else {
        // remove CSS from index.html
        removeCss(document, filename, "head");
        // remove CSS from ayop-logo.svg
        var svgDocument = document.getElementById("ayop_logo").contentDocument;
        if (svgDocument == null) {
            // SVG document isn't ready yet, try again
            setTimeout(function () { toggleTheme(filename, enable); }, 10);
            return;
        }
        removeCss(svgDocument, "../" + filename, "defs");
    }
}
$("#themes label input").click(function() {
    toggleTheme("css/" + this.value, this.checked);
});

function slideshowLoaded(frame, img) {
    if (currentFrame == frame) {
        ctx3.drawImage(img, 0, 0);
    }
}

//If frameData object special is set to 1, add frame to array.
function createSpecialFramesArray() {
    for(i = 1; i <= frameCount; i++) {
        if(frameData[i].special == "1") {
            specialFrames.push(i);
        }
    }
    specialFrames.sort(function (a, b) {return a - b;});
}

//TODO: move it to the right script file.
function disableButton(jqueryButton) {
    if (!jqueryButton.attr('disabled')) {
        jqueryButton.attr('disabled', 'disabled');
    }
}
function enableButton(jqueryButton) {
    if (jqueryButton.attr('disabled')) {
        jqueryButton.removeAttr('disabled');
    }
}

function setButtonEnabled(jqueryButton, enabled) {
    if (enabled) {
        enableButton(jqueryButton);
    } else {
        disableButton(jqueryButton);
    }
}

function updateButtons() {
    setButtonEnabled($('#first'), currentFrame > 1);
    setButtonEnabled($('#previous-special'), prevSpecial(currentFrame, $('#PauseDebatedFrames').prop('checked'))
                     < currentFrame); // prevSpecial underflows if there are no more previous special frames
    setButtonEnabled($('#previous'), currentFrame > 1);
    setButtonEnabled($('#next'), currentFrame < frameCount);
    setButtonEnabled($('#next-special'), nextSpecial(currentFrame, $('#PauseDebatedFrames').prop('checked'))
                     > currentFrame); // nextSpecial overflows if there are no more next special frames
    setButtonEnabled($('#last'), currentFrame < frameCount);
}
$('#PauseDebatedFrames').change(updateButtons); // if the only previous/next special frames are debated ones,
                                                // changes here have to disable/enable the previous/next-special buttons

//Updates elements of the page that change as.
function updateAllWithoutSlider(frame) {
    var oldframe = currentFrame;
    var oldCompareFrame = currentCompareFrame;
    currentFrame = frame;
    updateLastSeen(frame);

    $('#framecount input').val(frame);
    $('#totalframes').html(frameCount);
    $('#yay').html(frameData[frame].yes);
    $('#nay').html(frameData[frame].no);
    updateButtons(); // updates first, previous-special, previous, next, next-special, last

    //hot debate and make it glow
    $('#debated').addClass('notvisible');
    $('#canvas3').removeClass('special-glow debated-glow normal-glow');
    if(isSpecial(frame)) {
        if(isDebated(frame)) {
            $('#debated').removeClass('notvisible');
            $('#canvas3').addClass('debated-glow');
        } else {
            $('#canvas3').addClass('special-glow');
        }
    } else {
        $('#canvas3').addClass('normal-glow');
    }

    if (difftype == "prev") {
        diff();
        currentCompareFrame = frame - 1;
        displayURL(frame, 'long', currentCompareFrame);
        $('#freezeframe').val(currentCompareFrame);
    } else if (difftype == "freeze") {
        currentCompareFrame = parseInt($('#freezeframe').val(), 10);
        diff(currentCompareFrame);
        displayURL(frame, 'long', currentCompareFrame);
    } else {
        currentCompareFrame = 0;
        if (!$('#urlCheckBox').is(':checked')) {
            displayURL(frame, 'short');
        } else {
            displayURL(frame, 'long');
        }
        preloadFrame(frame, slideshowLoaded);
    }
    updatePreloadingIndicator(oldframe);
    updatePreloadingIndicator(currentFrame);
    updatePreloadingIndicator(oldCompareFrame);
    updatePreloadingIndicator(currentCompareFrame);

    //no most people will never see it, but it makes looking through the bitly links page easier.
    document.title = "xkcd Time - at your own pace (" + frame + ")";
}

function updateAll(frame) {
    slider.value = frame;
    updateAllWithoutSlider(frame);
}
