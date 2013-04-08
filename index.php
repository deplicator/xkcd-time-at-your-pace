<!DOCTYPE html>
<?php
if(isset($_REQUEST['frame'])) {
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
        <a href="https://github.com/deplicator">
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
        </div>
        <img id="slideshow" src="http://www.explainxkcd.com/wiki/images/f/f8/time.png" />
        <div id="slider"></div>
        <!--<div id="preview">
        <img><img><img><img><img><img><img>
        </div>-->
        <div id="link">
            <span>Link directly to this frame -></span><input type="text" size="50" readonly>
        </div>
        
    </div>
    
    <div id="interest">
        <h3>Points of Interest</h3><span>per <a href="http://xkcd-time.wikia.com/wiki/Periods">http://xkcd-time.wikia.com/wiki/Periods</a></span>
        <ul>
            <li>1:   <a href="./?frame=1">The very first frame, revealed before most Initiates were initiated</a></li>
            <li>16:  <a href="./?frame=16">Cueball dips his toe in the 'water', revealing the existence of the 'beach'</a></li>
            <li>25:  <a href="./?frame=25">Megan begins to build the first Castle</a></li>
            <li>34:  <a href="./?frame=34">The first Tower is finished</a></li>
            <li>50:  <a href="./?frame=50">The first Wall is completed</a></li>
            <li>52:  <a href="./?frame=52">Cueball leaves. This is also the first frame with text: Later/Bye!</a></li>
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
        </ul>
    </div>
    <script src="scripts/scroll1190.js"></script>
    
    <footer>
        <div id="credit">
            XKCD is licensed by <a href="http://www.xkcd.com/about/">Randall Munroe</a> under a <a href="http://www.xkcd.com/license.html">Creative Commons Attribution-NonCommercial 2.5 License</a>, please give credit where it is due (because he's a cool guy as far as I can tell from being a regular reader of his comic).
        </div>
        <p id="note">Your screen is really wide.</p>
        <a href="mailto:james@geekwagon.net" title="Find a bug? Suggestion? Complaint? Please email me.">Feedback</a> | <a href="https://gist.github.com/deplicator/5275082" title="The script that grabs new images.">gist</a> | <a href="http://geekwagon.net" title="Just some guy">Who am I?</a>
    </footer>
<body>