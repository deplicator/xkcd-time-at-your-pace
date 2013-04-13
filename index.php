<!DOCTYPE html>
<?php
if(isset($_REQUEST['frame']) && is_numeric($_REQUEST['frame'])) {
    echo '<script>var frame = ' . $_REQUEST['frame'] . ';</script>';
} else {
    echo '<script>var frame = 1;</script>';
}
?>
<head>
    <title>XKCD Time - at your own pace</title>
    <link rel="stylesheet" href="css/default.css">
    <script src="scripts/jquery.js"></script>
    <script src="scripts/jquery-ui.min.js"></script>
    <script src="scripts/jquery.ui.touch-punch.min.js"></script>
    <script src="scripts/jquery.timer.js"></script>
    <script src="scripts/analytic.js"></script>
</head>

<body>
    <header>
        <h1>XKCD 1190 - <a href="http://www.xkcd.com/1190/" title="Link to original">Time</a></h1>
        <h2>at your own pace</h2>
        <a href="https://github.com/deplicator/xkcdTime_atyourownpace">
            <img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" alt="Fork me on GitHub">
        </a>
    </header>
        <div id="LoadingImage">loading</div>
    <div id="tehmainevent">
        <div id="instructions">
            <p>Hover over image and scroll down to move forward, up to move back.</p>
        </div>
        <div id="controls">
            Or use these -> <input id="play" type="button" value="Play" title="You can still scroll while it's playing (for the nerdiest of instant replays)"><input id="slow" type="button" value="Slower"><input id="fast" type="button" value="Faster">
            <span id="speed"></span>
            <span id="step">
                <input id="previous" type="button" value="<<" title="Previous">
                <input id="next" type="button" value=">>" title="Next">
            </span>
        </div>
        <img id="slideshow" src="http://www.explainxkcd.com/wiki/images/f/f8/time.png" />
        <div id="slider"></div>
        <div id="link">
            <span>link directly to this frame -><input id="actuallink" type="text" size="50" readonly><input id="urlCheckBox" type="checkbox">show long url</span>
        </div>

    </div>

    <div id="textframes">
        <h3>Frames with Text</h3>
        <ul>
            <li><a href="./?frame=52"><img src="http://imgs.xkcd.com/comics/time/a790d74849afdba2bc7f1781ea6fca9fb62b57d46912b14c40d777843d493f1f.png" alt="" /></a></li>
            <li><a href="./?frame=170"><img src="http://imgs.xkcd.com/comics/time/0a17cbccb6644aeba7896c8ed20857941e2a0fdd6e21d58cdf6ea1074de81a2d.png" alt="" /></a></li>
            <li><a href="./?frame=175"><img src="http://imgs.xkcd.com/comics/time/0c13b40fb2d866d6d00a267bbb71f844731d97ed9982f97f1ddc0eaa1a054cb5.png" alt="" /></a></li>
            <li><a href="./?frame=320"><img src="http://imgs.xkcd.com/comics/time/9afac8bc8b182103a28f21b3a7e453d830102c3b4c8d31a0255669aafad0dca3.png" alt="" /></a></li>
            <li><a href="./?frame=408"><img src="http://imgs.xkcd.com/comics/time/5b030d59f46132186bc963e743f1171717e3a6ef63a502c7ad4946c06469ecbe.png" alt="" /></a></li>
            <li><a href="./?frame=414"><img src="http://imgs.xkcd.com/comics/time/cad084bde3a758a538360d6640aa6e2b26273b320eb68ea99bb3a8084d840925.png"></a></li>
            <li><a href="./?frame=486"><img src="http://imgs.xkcd.com/comics/time/94547ab634e00575bbf9086b232f1f38b7a4269edb0f6dff61716094e3af4d0d.png"></a></li>
            <li><a href="./?frame=487"><img src="http://imgs.xkcd.com/comics/time/840355510c22bac0a6e52ec0945997b670d8ad1053465d1929d4320ca4150488.png"></a></li>
            <li><a href="./?frame=488"><img src="http://imgs.xkcd.com/comics/time/28fd8090ab04b85611fa82990b14740f2d331f651d90e67c88dbc8512554193d.png"></a></li>
            <li><a href="./?frame=490"><img src="http://imgs.xkcd.com/comics/time/039d849c96bcf5a3db4c9ad70f6118f092df7380fd237c56becd414dd37a590f.png"></a></li>
        </ul>
    </div>

    <div id="interest">
        <h3>Points of Interest</h3>
        <p id="small">from <a href="http://xkcd-time.wikia.com/wiki/Periods">http://xkcd-time.wikia.com/wiki/Periods</a></p>
        <ul>
            <li>1:   <a href="./?frame=1">The very first frame</a></li>
            <li>16:  <a href="./?frame=16">Cueball dips his toe in the 'water'</a></li>
            <li>25:  <a href="./?frame=25">Megan begins to build the first Castle</a></li>
            <li>34:  <a href="./?frame=34">The first Tower is finished</a></li>
            <li>50:  <a href="./?frame=50">The first Wall is completed</a></li>
            <li>52:  <a href="./?frame=52">First text frame</a></li>
            <li>75:  <a href="./?frame=75">Cueball returns</a></li>
            <li>88:  <a href="./?frame=88">Megan Leaves</a></li>
            <li>103: <a href="./?frame=103">Cueball falls, destroying a piece of the castle.</a></li>
            <li>124: <a href="./?frame=124">Cueball leaves again (second time)</a></li>
            <li>137: <a href="./?frame=137">The first glimpse of the second Castle</a></li>
            <li>143: <a href="./?frame=143">The prophesied Frame, posted before its Time</a></li>
            <li>146: <a href="./?frame=146">Megan re-appears</a></li>
            <li>158: <a href="./?frame=158">Cueball re-appears</a></li>
            <li>170: <a href="./?frame=170">Second Text frame: "Wanna Swim?"</a></li>
            <li>175: <a href="./?frame=175">Third Text frame: Megan Coughs</a></li>
            <li>177: <a href="./?frame=177">Megan Leaves again (second time)</a></li>
            <li>179: <a href="./?frame=179">Cueball leaves again (third time)</a></li>
            <li>306: <a href="./?frame=306">Cueball re-appears</a></li>
            <li>308: <a href="./?frame=308">Cueball and Megan wave at each other</a></li>
            <li>309: <a href="./?frame=309">Megan falls, destroying a piece of castle</a></li>
            <li>320: <a href="./?frame=320">Fourth Text frame: The River question</a></li>
            <li>403: <a href="./?frame=403">Close-up of Megan holding tiny trebuchet</a></li>
            <li>408: <a href="./?frame=408">Fifth Text frame</a></li>
            <li>414: <a href="./?frame=414">Sixth Text frame</a></li>
            <li>486: <a href="./?frame=486">Seventh Text frame</a></li>
            <li>487: <a href="./?frame=487">Eighth Text frame</a></li>
            <li>488: <a href="./?frame=488">Ninth Text frame</a></li>
            <li>490: <a href="./?frame=490">Tenth Text frame, ten text frames ha ha ha</a></li>
        </ul>
    </div>
    <script src="scripts/scroll1190.js"></script>

    <footer>
        <div id="credit">
            XKCD is licensed by <a href="http://www.xkcd.com/about/">Randall Munroe</a> under a <a href="http://www.xkcd.com/license.html">Creative Commons Attribution-NonCommercial 2.5 License</a>, please give credit where it is due (because he's a cool guy as far as I can tell from being a regular reader of his comic).
        </div>
        <p id="note">Your screen is really wide.</p>
        <a href="mailto:james@geekwagon.net" title="Find a bug? Suggestion? Complaint? Please email me.">Feedback</a> | <a href="http://geekwagon.net" title="Just some guy">Who am I?</a>
    </footer>
<body>