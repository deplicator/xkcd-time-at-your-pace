<?php
/*
 * This uses the data.txt to recreate an image folder.
 * Will overwrite images already in images folder.
 * This can take a few minutes to run.
 */
header('Content-Type: text/plain');
set_time_limit(0);

function savePhoto($remoteImage, $isbn) {
    $ch = curl_init();
    curl_setopt ($ch, CURLOPT_URL, $remoteImage);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
    $fileContents = curl_exec($ch);
    curl_close($ch);
    $newImg = imagecreatefromstring($fileContents);
    return imagepng($newImg, "./images/".$isbn.'.png');
}

$file = "data.txt";
$data = file($file);
$count = 0;

foreach ($data as $piclink) {
    $pic = explode('/',$piclink);
    savePhoto($piclink, $count);
    $count++;
    echo $count . ".png created.";
}