<?php
/*
 * This file adds the current time comic image to the data.txt file.
 */
$location = get_headers('http://imgs.xkcd.com/comics/time.png')[15];
$newpic = substr($location, 10);

$file = "data.txt";
$data = file($file);
$lastline = $data[count($data)-1];

$frame = count($data);
$eventtime = date("c");

if($lastline != $newpic && !empty($newpic)) {
    try {
        file_put_contents("data.txt", "\n" . $newpic, FILE_APPEND);

        $ch = curl_init();
        curl_setopt ($ch, CURLOPT_URL, $newpic);
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
        $fileContents = curl_exec($ch);
        curl_close($ch);
        $newImg = imagecreatefromstring($fileContents);
        imagepng($newImg, "./images/".$frame.'.png');

        echo $eventtime . " - Successful update. " . $newpic . "\n";

        echo $eventtime . " - Successful image copy. " . $frame . "\n";

    } catch (Exception $e) {
        echo $eventtime . " - Caught exception: ",  $e->getMessage(), "\n";
    }

} else {
    echo $eventtime . " - Already there. " . $newpic . "\n";
}