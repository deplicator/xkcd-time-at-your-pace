<?php
/* 
 * updateframes.php
 * Updates data folder and database.
 */

header('Content-Type: text/plain');
include('config.php');

//Setup variables.
$header = get_headers('http://imgs.xkcd.com/comics/time.png', 1); //Gets all header info.
@$link = end($header['Location']); //Link to original frame image from headers.
$hash = substr(end(explode("/", $link)), 0, -4); //Parse only hash from link.

$log = "./data/log.txt";
$dblog = "./data/dblog.txt"; //Stores database exceptions.
$json = "./data/linklist.js"; //Stores link to frames as json.

$eventtime = date("Y-m-d\tH:i:s"); //Time when stuff happens.
echo $eventtime . "\tRunning update script.\n";

function connectivityCheck($link) { //Check for link.
    if(is_null($link)) {
        return false;
        echo $eventtime . "\tCHECK FAIL - Could not connect to xkcd.\n";
    } else {
        return true;
    }
}

if(connectivityCheck($link)) {
    try {
        $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_READ_USER, DB_READ_PASS);    

        $recordCheck = true; //Check total records against highest frame number. They should be the same.
        
        $fcount = "SELECT COUNT(`frame`) FROM `frames`"; //counts all records in frames table
        $STH = $DBH->query($fcount);
        $frameByCount = $STH->fetch()[0];
        
        $fmax = "SELECT MAX(`frame`) FROM `frames`"; //max frame found in database
        $STH = $DBH->query($fmax);
        $frameByMax = $STH->fetch()[0];

        if($frameByCount != $frameByMax) {
            $recordCheck = false;
            echo $eventtime . "\tCHECK FAIL - Frames table row count does not match max frame in database.\n";
        }
        
        $repeatCheck = true; //Check current picture link against all past picture links. Should be unique.
        $sql = "SELECT `link` FROM `frames`";
        $STH = $DBH->query($sql);
        $STH->setFetchMode(PDO::FETCH_ASSOC);
        while($row = $STH->fetch()) {
            if($link == $row['link']) {
                $repeatCheck = false;
                echo $eventtime . "\tCHECK FAIL - A link with hash " . $hash . " is already in the database.\n";
                break;
            }
        }

        if($recordCheck && $repeatCheck && connectivityCheck($link)) {
            $frame = $frameByCount + 1;
            
            //Create Bitly short link for new frame, site url used so the same bitly link is created in test environments.
            $ch = curl_init('http://api.bitly.com/v3/shorten?login=' . BITLY_LOGIN . '&apiKey=' . BITLY_API . '&longUrl=http://geekwagon.net/projects/xkcd1190/?frame=' . $frame);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $shortURL = curl_exec($ch);
            $start = strpos($shortURL, 'http:\/\/bit.ly\/');
            $end = strpos($shortURL, '", "hash": "') - $start;
            $shortURL = substr($shortURL,$start,$end);
            $shortURL = str_replace('\\', '', $shortURL);
            file_put_contents($log, $eventtime . "\tCreated bitly link for frame " . $frame . ", (" . $shortURL . ").\n", FILE_APPEND);
            $blink = $shortURL;

            //Update database.
            $llink = "http://geekwagon.net/projects/xkcd1190/data/frames/" . $frame . ".png";
            $data = [$frame, $link, $llink, $blink];
            $STH = $DBH->prepare("INSERT INTO frames (frame, link, llink, blink) value (?, ?, ?, ?)");
            $STH->execute($data);
            echo $eventtime . "\tRecord for frame " . $frame . " added to database.\n";

            //Local image copy check.
            $imageCheck = true; //local image copy check
            if(file_exists('./data/frames/'.$frame.'.png')) {
                $imageCheck = false;
                echo $eventtime . "\tCHECK FAIL - An image named " . $frame . ".png is already in the frames folder.\n";
            }

            //Update frame folder.
            if($imageCheck) {
                $ch = curl_init();
                curl_setopt ($ch, CURLOPT_URL, $link);
                curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
                $fileContents = curl_exec($ch);
                $newImage = imagecreatefromstring($fileContents);
                curl_close($ch);
                
                if(!empty($newImage)) {
                    imagepng($newImage, './data/frames/' . $frame . '.png');
                    if(file_exists('./data/frames/' . $frame . '.png')) { //Double check that it is actually there.
                        echo $eventtime . "\tSuccessful copy of " . $frame . ".png.\n";
                    } else {
                        echo $eventtime . "\tCOPY FAIL - Could not write " . $frame . ".png.\n";
                    }
                } else {
                    echo $eventtime . "\tCOPY FAIL - Nothing to write for " . $frame . ".png.\n";
                }
            }

            //Update data.txt file, for old times sake.
            $data = "./data/data.txt"; //Stores link to frames in simple text.
            $dataContents = file($data);
            
            $fileCheck = true; //Check line number in file against current frame number. They should be the same.
            if(count($dataContents) != $frame) {
                $fileCheck = false;
                echo $eventtime . "CHECK FAIL - data.txt count doesn't match database count.\n";
            }

            if($fileCheck) {
                file_put_contents($data, "\n" . $link, FILE_APPEND);
                echo $eventtime . "\tSuccessfully added frame " . $frame . " link to data.txt.\n";
            }
        }
    }  catch(PDOException $e) {
            $errmsg = $eventtime . "\t" . $e->getMessage() . "\n";
            echo $errmsg;
            file_put_contents($dblog, $errmsg, FILE_APPEND);
    }
} else {
    echo $eventtime . "\tCHECK FAIL - Could not connect to xkcd.\n";
}