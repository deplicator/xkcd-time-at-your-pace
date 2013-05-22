<?php
header("Content-Type: application/json", true);
include('../config.php');

//TODO: do not create a new PDO in every function
//TODO: Remove this file, because it is obsoloete with 780bde7fa076d1bffb70dc5a20345fe458d3c538
/*
 * Flags frames as special or not. Optional second parameter set to true to unflag as special.
 */
function makeSpecial($frame, $unmake = false) {
    try {
        $DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);
        $STH = $DBH->prepare("UPDATE frames SET special=? WHERE frame=?");
        if(!$unmake) {
            $STH->execute(array(1, $frame));
        } else {
            $STH->execute(array(0, $frame));
        }
    } catch(PDOException $e) {
        $dblog = "../data/dblog.txt"; //Stores database exceptions.
        $msg = $eventtime . "\t" . $e->getMessage() . "\n";
        file_put_contents($dblog, $msg, FILE_APPEND);
    }
}

/*
 * Creates a text file that lists current special frames.
 * This is only used to get a date/time for last update of special frames, though it might be useful
 * for other things. I'm open to better ways.
 */
function makeList() {
    try {
        $DBH = new PDO(PDO_CONNECTION, DB_READ_USER, DB_READ_PASS);
        $STH = $DBH->query("SELECT frame FROM frames WHERE special=1");
        $STH->setFetchMode(PDO::FETCH_ASSOC);
        $file = "../data/sflist.txt";
        file_put_contents($file, "");
        while($row = $STH->fetch()) {
            file_put_contents($file, $row['frame'] . "\n", FILE_APPEND);
        }

    } catch(PDOException $e) {
        $dblog = "../data/dblog.txt"; //Stores database exceptions.
        $msg = $eventtime . "\t" . $e->getMessage() . "\n";
        file_put_contents($dblog, $msg, FILE_APPEND);
    }
}

try {
    $DBH = new PDO(PDO_CONNECTION, DB_READ_USER, DB_READ_PASS);

    $STH = $DBH->query("SELECT * FROM votes");
    $STH->setFetchMode(PDO::FETCH_ASSOC);

    //Calculates average yes votes of all frames, may not be neccessary because it creates an abusrdly low number.
    // $totalframes = 0;
    // $totalavg = 0;
    // while($row = $STH->fetch()) {
        // $totalframes += 1;
        // $totalavg += $row['voteyes'];
    // }
    // $avg = $totalavg/$totalframes;

    $STH = $DBH->query("SELECT * FROM votes");
    while($row = $STH->fetch()) {
        if($row['voteyes'] >= 5 /*&& $row['voteyes'] >= $avg*/) { //set to 5 for right now, should be more than the daily vote limit.
            makeSpecial($row['frame']);
            echo $row['frame'] . "\n";
        }
        if($row['voteyes'] < ($row['voteno'] / 2)) { //If there are double the no votes than yes votes, frame is unmarked special.
            makeSpecial($row['frame'], true);
            echo $row['frame'] . "\n";
        }
    }
    
    makeList();

} catch(PDOException $e) {
    $dblog = "../data/dblog.txt"; //Stores database exceptions.
    $msg = $eventtime . "\t" . $e->getMessage() . "\n";
    file_put_contents($dblog, $msg, FILE_APPEND);
}