/*
 * User Interface cosmetics.
 */

//Play back direction buttons.
$('.direction').click(function() {
    if(!$(this).hasClass('dir-select')) {
        $('.direction').toggleClass('dir-select');
    }
});

//Toggeling boxes below comic.
$('#funstuff h3').click(function () {
    $('#funstuff #inside').slideToggle('slow', function() {
        if($('#funstuff h3 .craparrow').html() == '→') {
            $('#funstuff h3 .craparrow').html('↓')
        } else {
            $('#funstuff h3 .craparrow').html('→');
        }
    });
});

$('#textframes h3').click(function () {
    $('#textframes ul').slideToggle('slow', function() {
        if($('#textframes h3 .craparrow').html() == '→') {
            $('#textframes h3 .craparrow').html('↓')
        } else {
            $('#textframes h3 .craparrow').html('→');
        }
    });
});