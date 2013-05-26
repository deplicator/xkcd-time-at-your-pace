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

$(document).ready(function () {
    
    if(panels[0] == '0') {
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
            //l2transversedom
            if ($(this).parent().children('h3').children('.craparrow').html() == rightArrow) {
                $(this).parent().children('h3').children('.craparrow').html(downArrow);
                if($(this).parent().attr('id') == 'framedata') {
                    $.cookie('ayop-panel', [0]);
                    panels[0] = 0;
                
                
                
                    
                } else if($(this).parent().attr('id') == 'specialframes' && !specialFramesPanelLoaded) {
                    loadSpecialFramePanel();
                    specialFramesPanelLoaded = true;
                } else if($(this).parent().attr('id') == 'pastday' && !specialFramesPanelLoaded) {
                    loadPastPanel(24, '#pastday-framelist');
                    pastDayPanelLoaded = true;
                } else if($(this).parent().attr('id') == 'pastweek' && !specialFramesPanelLoaded) {
                    loadPastPanel(168, '#past-weekframelist');
                    pastWeekPanelLoaded = true;
                }
            } else {
                $(this).parent().children('h3').children('.craparrow').html(rightArrow);
                if($(this).parent().attr('id') == 'framedata') {
                    $.cookie('ayop-panel', [1]);
                }
            }
        });
    });
    
    var donatelinks = ["https://support.worldwildlife.org/site/SPageServer?pagename=donate_to_charity&s_src=AWE1302GD914",
                       "http://wikimediafoundation.org/wiki/Ways_to_Give",
                       "http://worldwish.org/en/donate/index.php",
                       "http://store.xkcd.com/"];
    $('#donate').html("<a href=\"" + donatelinks[Math.floor(Math.random()*4)] + "\">Donate</a>");
});