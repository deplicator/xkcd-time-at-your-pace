<?php
/*
 * This file creates the bitly short url and bitlydata.txt file. The data file will automatically be
 * created, but may take time becuase of bitly api request limitations.
 */

include('config.php');

//Current frame count so we don't try to request things that don't need to be requested.
//http://stackoverflow.com/questions/2162497/efficiently-counting-the-number-of-lines-of-a-text-file-200mb
$file="data.txt";
$linecount = 0;
$handle = fopen($file, "r");
while(!feof($handle)){
  $line = fgets($handle);
  $linecount++;
}
fclose($handle);

if(isset($_REQUEST['frame']) && is_numeric($_REQUEST['frame']) && $_REQUEST['frame'] < $linecount && $_REQUEST['frame'] > 1) {
    $frame = intval($_REQUEST['frame']);
} else {
    $frame = 1;
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

    if (!is_writable($file)) {
        echo "{$file} is not writable, not creating a new url";
        exit;
    }

    //URL should not be hard coded, but for now it is (because I don't want to make millions of bitly links while testing.
    $ch = curl_init('http://api.bitly.com/v3/shorten?login=' . BITLY_LOGIN . '&apiKey=' . BITLY_API . '&longUrl=http://geekwagon.net/projects/xkcd1190/?frame=' . $frame);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $shortURL = curl_exec($ch);
    $start = strpos($shortURL, 'http:\/\/bit.ly\/');
    $end = strpos($shortURL, '", "hash": "') - $start;
    $shortURL = substr($shortURL,$start,$end);
    $shortURL = str_replace('\\', '', $shortURL);
    file_put_contents($file, $frame . ' ' . $shortURL . "\r\n", FILE_APPEND);

    $eventtime = date("Y-m-d\tH:i:s");
    file_put_contents('log.txt', $eventtime . "\tCreated bitly link for frame " . $frame . ", " . $shortURL . "\n", FILE_APPEND);

    echo $shortURL;
}
