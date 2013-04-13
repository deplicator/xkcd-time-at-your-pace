<?php
/* 
 * This file creates the bitly short url and bitlydata.txt file. The data file will automatically be
 * created, but may take time becuase of bitly api request limitations.
 */
 
include('config.php');

if(isset($_REQUEST['frame'])) {
    $frame = $_REQUEST['frame'];
} else {
    $frame = 0;
}

$file = 'bitlydata.txt';
$lines = file($file);

$bitlyCheck = False;

foreach($lines as $line_num => $line) { //Look for an already exsisting bitly url.
    
    $breakitup = explode(" ", $line);
    
    if($frame != $breakitup[0]) {
        $bitlyCheck = False;
    } else {
        $bitlyCheck = True;
        echo $breakitup[1];
        break; //Once it's found stop looking.
    }
}

if($bitlyCheck == False) { //if it was not found, make one and add it to the file.
    //URL should not be hard coded, but for now it is (because I don't want to make millions of bitly links while testing.
    $ch = curl_init('http://api.bitly.com/v3/shorten?login=' . BITLY_LOGIN . '&apiKey=' . BITLY_API . '&longUrl=http://geekwagon.net/projects/xkcd1190/?frame=' . $frame);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $shortURL = curl_exec($ch);
    $start = strpos($shortURL, 'http:\/\/bit.ly\/');
    $end = strpos($shortURL, '", "hash": "') - $start;
    $shortURL = substr($shortURL,$start,$end);
    $shortURL = str_replace('\\', '', $shortURL);
    file_put_contents($file, $frame . ' ' . $shortURL . "\r\n", FILE_APPEND);
    
    $eventtime = date("c");
    file_put_contents('log.txt', $eventtime . " - Created bitly link for frame " . $frame . ": " . $shortURL . "\n", FILE_APPEND);
    
    echo $shortURL;
}