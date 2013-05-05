<?php
/*
 * This file adds the current time comic image to the data.txt file.
 */
header('Content-Type: text/plain');
$eventtime = date("Y-m-d\tH:i:s");

error_reporting(E_ERROR | E_PARSE);
//I hate to turn off error reporting, but it doesn't play nice with get_headers
//TODO: swich to curl. http://php.net/manual/en/function.get-headers.php

$header = get_headers('http://imgs.xkcd.com/comics/time.png', 1);
$newpic = end($header['Location']);
$data = file("data.txt"); //stores url to pic and uses line numbers to keep track of frame.
$lastline = $data[count($data)-1];

$frame = count($data);

if(empty($newpic)) {
    //if $newpic is empty, it probably could not access the site.
    echo $eventtime . "\tCould not access http://imgs.xkcd.com/comics/time.png.\n";

} else if($lastline != $newpic) {
    //If the last line in data.txta and newpic do not match, put the new image link at the end.
    //It should be noted, the line number the link is on is one higher than the frame.
    //For example, frame 100's link is on line 101.
    
    
    $checkto = $frame - 1000;
    $repeat = False;
    
    for($i = ($frame-1); $i > $checkto; $i--) {
        if($data[$i] == $newpic || $data[$i] == $newpic."\n") {
            $repeat = True;
            echo $repeat;
        }
    }
    
    if($repeat) {
        echo $eventtime . "\tNOT UPDATED Repeat hash in the last 1000 links , " . $newpic . "\n";
        
    } else {
        file_put_contents("data.txt", "\n" . $newpic, FILE_APPEND);
        echo $eventtime . "\tSuccessful update, " . $newpic . "\n";
        
        //Save the picture to images folder (currently only used for image difference).
        $ch = curl_init();
        curl_setopt ($ch, CURLOPT_URL, $newpic);
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
        $fileContents = curl_exec($ch);
        curl_close($ch);
        $newImg = imagecreatefromstring($fileContents);
        if(!empty($newImg)) {
            //Only save to images folder if the variable is not empty.
            //The name of the image relies on data.txt to be up to date.
            imagepng($newImg, './images/'.$frame.'.png');
        }
        if(file_exists('./images/'.$frame.'.png')) {
            //Double check that it is actually there.
            echo $eventtime . "\tSuccessful image copy, ./images/" . $frame . ".png\n";
        } else {
            //If not make a note of it.
            echo $eventtime . "\tError on image copy, ./images/" . $frame . ".png\n";
        }
    }
    
} else {
    //No new image.
    echo $eventtime . "\tAlready there, " . $newpic . "\n";
}