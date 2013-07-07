<?php
/* 
 * downloadFrames.php
 * Downloads frames from http://xkcd.mscha.org.
 * Converts frame numers from mscha to geekwagon where needed.
 */

header('Content-Type: text/plain');
/*
include('config.php');

$DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);

$findFrame = $DBH->prepare('SELECT * FROM frames WHERE frame = ?');
$insertFrame = $DBH->prepare('INSERT INTO frames (`update`, `frame`, `link`, `llink`, `blink`, `special`) VALUES (FROM_UNIXTIME(?), ?, ?, ?, ?, ?)');
$findVote = $DBH->prepare('SELECT * FROM votes WHERE frame = ?');
$insertVote = $DBH->prepare('INSERT INTO votes (`frame`, `voteyes`, `voteno`) VALUES (?, 0, 0)');
*/
$frames = json_decode(file_get_contents("http://xkcd.mscha.org/time.json"), true);

if (!$frames)
    die("Frame data not valid!\n\n");
    
foreach ($frames as $frame) {
    $skip = false;
    
    // Ugh, ensure it's a int, some frames end in an a?
    //$frame['frameNo'] += 0;

    //Fixes darkness for some reason?
    echo "\r";
    echo str_pad("", 80, " ");
    echo "\r";
    
    echo "Processing {$frame['frameNo']}... ";
    
    $frame['path'] = "./data/frames/{$frame['frameNo']}.png";
    
    if ($frame['frameNo'] == 1) {
        $frame['hash'] = 1;
    }

    //Special Case - Deals with "apocryphal" frames of 256-258.
    if ($frame['frameNo'] == "256a" || $frame['frameNo'] == "257a" || $frame['frameNo'] == "258a") {
        $skip = true;
        echo "Intentionally skipped!";
    }
    
    //Special Case - Meteor frames.
    if ($frame['frameNo'] == "2440a") {
        $frame['path'] = "./data/frames/2441.png";
    }
    
    if ($frame['frameNo'] == "2440b") {
        $frame['path'] = "./data/frames/2442.png";
    }
    
    if ($frame['frameNo'] == "2440c") {
        $frame['path'] = "./data/frames/2443.png";
    }
    if ($frame['frameNo'] == "2440d") {
        $frame['path'] = "./data/frames/2444.png";
    }
    
    if ($frame['frameNo'] == "2440e") {
        $frame['path'] = "./data/frames/2445.png";
    }
    
    //Special Case - All frames after meteor shifted by 5.
    if ($frame['frameNo'] >= "2441") {
        $newFrameNo = intval($frame['frameNo']) + 5;
        $frame['path'] = "./data/frames/" . $newFrameNo . ".png";
    }
    
    if (!file_exists($frame['path']) && !$skip) {
        echo "Downloading... ";
        $fp = fopen($frame['path'], 'w');
        $ch = curl_init($frame['downloadedUrl']);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        $data = curl_exec($ch);
        curl_close($ch);
        fclose($fp);
        chmod($frame['path'], 0744);
    }
    
    /*
    $findFrame->execute(array($frame['frameNo']));
    $res = $findFrame->fetch(PDO::FETCH_ASSOC);
    
    if (!$res) {
        echo "Inserting... ";
        
        $data = array($frame['dateTime'],
                      $frame['frameNo'],
                      $frame['downloadedUrl'],
                      $frame['llink'],
                      $frame['blink'],
                      $frame['special']);
        $res = $insertFrame->execute($data);
    }
    
    $findVote->execute(array($frame['frameNo']));
    $res = $findVote->fetch(PDO::FETCH_ASSOC);
    
    if (!$res) {
        echo "Votes... ";
        
        $data = array($frame['frameNo']);
        $res = $insertVote->execute($data);
    }*/
}

echo "\n\n";
