/*jslint browser: true, eqeq: true, sloppy: true*/
/*global $, loadSpecialFramePanel: false*/
/*
 * User Interface cosmetics.
 */

var panels = $.cookie('ayop-panel');

//load past frames
function loadPastPanel(num, container) {
    var sflen = specialFrames.length, i;
    var noop = function () {};
    var elem;
    num = frameCount - num;
    for (i = num; i <= frameCount; i++) {
        //TODO: do that with less dom traversing stuff. <-have you seen my toggle panel code below?
        elem = $('<li><a href="./?frame=' + frameData[i].llink + '"></a></li>');
        elem.children().first().prepend(preloadOneFrame(i, noop, true));
        $(container).append(elem);
    }
}

//Function to select the contents of any element
//http://aktuell.de.selfhtml.org/artikel/javascript/textauswahl/#markieren-funktion (german source)
function selectElementContent() {
    var elem = this;
    if (document.selection && document.selection.createRange) {
        var textRange = document.selection.createRange();
        textRange.moveToElementText(elem);
        textRange.select();
    } else if (document.createRange && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(elem);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

//Select all text in a text input
function textSelect() {
    $(this).select();
}


$(document).ready(function () {
    $('#manualinput').click(textSelect);
    $('#actuallink').click(selectElementContent);
    $('#freezeframe').click(textSelect);
    
    if(panels == 'closed') {
        $('#framedata .inside').hide('fast', function() {
            $('#framedata h3 .craparrow').html(rightArrow);
        });
    }
    
    //Play back direction buttons.
    $('.direction').click(function () {
        if (!$(this).hasClass('dir-select')) {
            $('.direction').toggleClass('dir-select');
        }
    });
    
    var rightArrow = '\u2192', downArrow = '\u2193';
    
    //Toggeling panels below comic.
    var specialFramesPanelLoaded = false;
    var pastDayPanelLoaded = false;
    var pastWeekPanelLoaded = false;
    $('.openingpanel h3').click(function () {
        $(this).siblings('.inside').slideToggle('slow', function () {
            try {
                //l2transversedom
                if ($(this).parent().children('h3').children('.craparrow').html() == rightArrow) {
                    $(this).parent().children('h3').children('.craparrow').html(downArrow);
                    if($(this).parent().attr('id') == 'framedata') {
                        $.cookie('ayop-panel', 'open');
                    } else if($(this).parent().attr('id') == 'specialframes' && !specialFramesPanelLoaded) {
                        loadSpecialFramePanel();
                        specialFramesPanelLoaded = true;
                    } else if($(this).parent().attr('id') == 'pastday' && !pastDayPanelLoaded) {
                        loadPastPanel(24, '#pastday-framelist');
                        pastDayPanelLoaded = true;
                    } else if($(this).parent().attr('id') == 'pastweek' && !pastWeekPanelLoaded) {
                        loadPastPanel(168, '#past-weekframelist');
                        pastWeekPanelLoaded = true;
                    }
                } else {
                    $(this).parent().children('h3').children('.craparrow').html(rightArrow);
                    if($(this).parent().attr('id') == 'framedata') {
                        $.cookie('ayop-panel', 'closed');
                    }
                }
            } catch (e) {
                // ignore, but catch
                // when this error isn't caught, subsequent slideToggles won't work.
            }
        });
    });
    
    /*
     * Only allow numbers to be typed. 
     * Callback is called, when the number is accepted with <enter> or the focus is lost.
     */
    function onlyAllowFrameNumbersAndArrows(jqueryElement, callback) {
        jqueryElement.keydown(function (event) {
            //Doesn't allow letters in the text box
            //http://stackoverflow.com/questions/995183/how-to-allow-only-numeric-0-9-in-html-inputbox-using-jquery
            if (
                event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
                     // Allow: Ctrl+A
                    (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (event.keyCode >= 35 && event.keyCode <= 40)
            ) {
                var number;
                if (event.keyCode == 38) {//up arrow key
                    number = (parseInt($(this).val(), 10) || 0) + 1;
                    if (number > frameCount)  {
                        number = 1;
                    }
                    $(this).val(number);
                    callback();
                } else if (event.keyCode == 40) { //down arrow key
                    number = (parseInt($(this).val(), 10) || (frameCount + 1)) - 1;
                    if (number < 1)  {
                        number = frameCount;
                    }
                    $(this).val(number);
                    callback();
                }
                // let it happen, don't do anything
                return;
            } else if (event.keyCode == 13) { //Enter
                callback();
            } else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105))) {
                    console.log("preventDefault")
                    event.preventDefault();
                }
            }
        }).blur(callback);
    }
    
    onlyAllowFrameNumbersAndArrows($('#manualinput'), function () {
        var manualinput = $('#manualinput').val();
        if (manualinput < 1) {
            updateAll(1);
        } else if (manualinput > frameCount) {
            updateAll(frameCount);
        } else {
            updateAll(parseInt(manualinput, 10) || 1);
        }
    });
    onlyAllowFrameNumbersAndArrows($('#freezeframe'), function () {
        var freezeframe = parseInt($('#freezeframe').val(), 10);
        if (freezeframe < 1) {
            $('#freezeframe').val(1);
        } else if (freezeframe > frameCount) {
            $('#freezeframe').val(frameCount);
        }
        updateAll(currentFrame);
    });

    var donatelinks = ["https://support.worldwildlife.org/site/SPageServer?pagename=donate_to_charity&s_src=AWE1302GD914",
                       "http://wikimediafoundation.org/wiki/Ways_to_Give",
                       "http://worldwish.org/en/donate/index.php",
                       "http://store.xkcd.com/"];
    $('#donate').html("<a href=\"" + donatelinks[Math.floor(Math.random()*4)] + "\">Donate</a>");

    // switch "Pause special frames" unit text between "seconds" and "second"
    $('#PauseSpecialFrameAmount').change(function() {
        var secondsElement = this.parentNode.childNodes[2];
        secondsElement.nodeValue = this.value == 1 ? ' second' : ' seconds';
    });
    $('#PauseSpecialFrameAmount').change(); // fire one to fix the text in case the browser remembered a "1" value
});
