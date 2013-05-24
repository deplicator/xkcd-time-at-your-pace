<?php
/*
 * This uses the data.txt to recreate an image folder.
 * Will overwrite images already in images folder.
 * This can take a few minutes to run.
 */
header('Content-Type: text/plain');
set_time_limit(0);

function savePhoto($remoteImage, $target) {
    if (file_exists($target))
        return true;
    $ch = curl_init();
    curl_setopt ($ch, CURLOPT_URL, $remoteImage);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
    $fileContents = curl_exec($ch);
    curl_close($ch);
    if (strlen($fileContents) == 0)
        return false;
    $newImg = imagecreatefromstring($fileContents);
    if ($newImg === false)
        return false;
    return imagepng($newImg, $target);
}

$file = "data.txt";
$data = file($file);
$count = 1;
$target_dir = './images';

if (!file_exists($target_dir))
    mkdir($target_dir);

if (!is_dir($target_dir)) {
    echo "{$target_dir} exists and is not a dir? I don't know what to do...\n";
    exit(1);
}

foreach ($data as $piclink) {
    $piclink = trim($piclink);
    if ($piclink == '')
        continue;

    $res = savePhoto($piclink, "{$target_dir}/{$count}.png");

    if ($res)
        echo "Processing {$count}.png\r";
    else
        echo "\n{$count}.png not created! url: '{$piclink}'\n";

    $count++;
}

echo "\nDone!\n\n";
