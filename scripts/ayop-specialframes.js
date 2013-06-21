/*jslint browser: true, sloppy: true, plusplus: true, vars: true */
/*global $, preloadOneFrame, specialFrames:false */

/*
 * Add the special-frames to the html
 */
//change this to happen when special frame panel is opened.
function loadSpecialFramePanel() {
    var sflen = specialFrames.length, i;
    var noop = function () {};
    var container = $('#textframelist');
    var elem;
    for (i = 0; i < sflen; i++) {
        //TODO: do that with less dom traversing stuff.
        elem = $('<li><a href="./?frame=' + specialFrames[i] + '"></a></li>');
        elem.children().first().prepend(preloadOneFrame(specialFrames[i], noop, true));
        container.append(elem);
    }
}

// Thanks to jfriend00 on http://stackoverflow.com/questions/10264239/fastest-way-to-determine-if-an-element-is-in-a-sorted-array
function binary_search_iterative(a, value) {
    var lo = 0, hi = a.length - 1, mid;
    while (lo <= hi) {
        mid = Math.floor((lo + hi) / 2);
        if (a[mid] > value) {
            hi = mid - 1;
        } else if (a[mid] < value) {
            lo = mid + 1;
        } else {
            return mid;
        }
    }
    return -(lo + 1);
}

function isSpecial(frame) {
    return binary_search_iterative(specialFrames, frame) >= 0;
}

function isDebated(frame) {
    return frameData[frame].no >= 5 && frameData[frame].yes > (frameData[frame].no / 1.9);
}

function nextSpecial(frame) {
    var result = binary_search_iterative(specialFrames, frame);
    result = result >= 0 ? result + 1 : -1 * (result + 1);
    return specialFrames[result % specialFrames.length];
}

function prevSpecial(frame) {
    var result = binary_search_iterative(specialFrames, frame);
    result = result >= 0 ? result - 1 : -1 * (result + 1) - 1;
    return specialFrames[(result + specialFrames.length) % specialFrames.length];
}
