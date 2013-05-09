/*jslint sloppy: true, vars: true, browser: true, plusplus: true, regexp: true*/
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
var lastSeenFrame = lastSeen();
function getLastSeen() {
    return lastSeenFrame;
}
function updateLastSeen(frame) {
    if (frame > lastSeenFrame) {
        lastSeenFrame = frame;
        var expire = new Date();
        expire.setFullYear(expire.getFullYear() + 1);
        document.cookie = 'lastSeen=' + frame + '; expires=' + expire.toGMTString();
    }
}