<?php
/*
 * This uses the data.txt to recreate an image folder.
 */

function savePhoto($remoteImage, $isbn) {
    $ch = curl_init();
    curl_setopt ($ch, CURLOPT_URL, $remoteImage);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
    $fileContents = curl_exec($ch);
    curl_close($ch);
    $newImg = imagecreatefromstring($fileContents);
    return imagepng($newImg, "./test/".$isbn.'.png');
}

$file = "data.txt";
$data = file($file);
$count = 0;

foreach ($data as $piclink) {
    $pic = explode('/',$piclink);
    savePhoto($piclink, $count);
    $count++;
}