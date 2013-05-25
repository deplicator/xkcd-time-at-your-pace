/*jslint browser: true, eqeq: true, sloppy: true*/
/*global $, loadSpecialFramePanel: false*/
/*
 * User Interface cosmetics.
 */

$(document).ready(function () {
    //Play back direction buttons.
    $('.direction').click(function () {
        if (!$(this).hasClass('dir-select')) {
            $('.direction').toggleClass('dir-select');
        }
    });
    
    var rightArrow = '\u2192', downArrow = '\u2193';
    
    //Toggeling boxes below comic.
    $('#framedata h3').click(function () {
        $('#framedata .inside').slideToggle('slow', function () {
            if ($('#framedata h3 .craparrow').html() == rightArrow) {
                $('#framedata h3 .craparrow').html(downArrow);
            } else {
                $('#framedata h3 .craparrow').html(rightArrow);
            }
        });
    });

    var specialFramesPanelLoaded = false;
    $('#specialframes h3').click(function () {
        $('#specialframes .inside').slideToggle('slow', function () {
            if ($('#specialframes h3 .craparrow').html() == rightArrow) {
                $('#specialframes h3 .craparrow').html(downArrow);
                if (!specialFramesPanelLoaded) {
                    loadSpecialFramePanel();
                    specialFramesPanelLoaded = true;
                }
            } else {
                $('#specialframes h3 .craparrow').html(rightArrow);
            }
        });
    });
    
    var donatelinks = ["https://support.worldwildlife.org/site/SPageServer?pagename=donate_to_charity&s_src=AWE1302GD914",
                       "http://wikimediafoundation.org/wiki/Ways_to_Give",
                       "http://worldwish.org/en/donate/index.php",
                       "http://store.xkcd.com/"];
    $('#donate').html("<a href=\"" + donatelinks[Math.floor(Math.random()*4)] + "\">Donate</a>");
});