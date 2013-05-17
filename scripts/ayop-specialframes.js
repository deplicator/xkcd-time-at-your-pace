/*jslint browser: true, sloppy: true, plusplus: true */
/*global $:false */
var specialframes = [52, 170, 175, 320, 403, 408, 414, 486, 487, 488, 490, 531, 537, 538, 562, 563,
                     564, 637, 638, 640, 641, 642, 659, 660, 661, 832, 833, 834, 835, 838, 855, 856,
                     857, 859, 860, 861, 862, 864, 865, 985, 1004, 1005, 1006, 1018, 1024, 1025,
                     1041, 1042, 1044, 1045, 1049, 1050, 1052, 1053, 1058, 1066, 1067, 1069, 1071,
                     1072, 1073, 1093, 1096, 1123, 1130, 1131, 1142, 1143, 1144, 1146, 1159, 1160,
                     1161, 1178, 1179, 1184, 1212, 1213, 1218, 1339, 1341, 1343, 1378, 1380, 1381,
                     1383, 1386, 1407, 1408, 1409
                     ].sort(function (a, b) {
        return a - b;
    });

/*
 * Add the special-frames to the html
 */
$(document).ready(function () {
    var sflen = specialframes.length, i;
    for (i = 0; i < sflen; i++) {
        $('#textframelist').append('<li><a href="./?frame=' + specialframes[i] + '"><img src="./images/' + specialframes[i] + '.png" alt=""></a></li>');
    }
});
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
    return binary_search_iterative(specialframes, frame) >= 0;
}

function nextSpecial(frame) {
    var result = binary_search_iterative(specialframes, frame);
    result = result >= 0 ? result + 1 : -1 * (result + 1);
    return specialframes[result % specialframes.length];
}

function prevSpecial(frame) {
    var result = binary_search_iterative(specialframes, frame);
    result = result >= 0 ? result - 1 : -1 * (result + 1) - 1;
    return specialframes[(result + specialframes.length) % specialframes.length];
}
