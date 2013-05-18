<?php
header("Content-Type: application/json", true);
include('../config.php');

/*
 * Flags frames as special or not. Optional second parameter set to true to unflag as special.
 */
function makeSpecial($frame, $unmake = false) {
    $DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);
    $STH = $DBH->prepare("UPDATE frames SET special=? WHERE frame=?");
    if(!$unmake) {
        $STH->execute(array(1, $frame));
    } else {
        $STH->execute(array(0, $frame));
    }
}

try {
    $DBH = new PDO(PDO_CONNECTION, DB_READ_USER, DB_READ_PASS);

    $STH = $DBH->query("SELECT * FROM votes");
    $STH->setFetchMode(PDO::FETCH_ASSOC);

    $totalframes = 0;
    $totalavg = 0;
    while($row = $STH->fetch()) {
        $totalframes += 1;
        $totalavg += $row['voteyes'];
    }
    
    $avg = $totalavg/$totalframes;

    $STH = $DBH->query("SELECT * FROM votes");
    while($row = $STH->fetch()) {
        if($row['voteyes'] >= 5 && $row['voteyes'] >= $avg) { //frame should have 5 votes and be higher than the average across all frames to be special.
            makeSpecial($row['frame']);
            echo $row['frame'] . "\n";
        }
        if($row['voteyes'] < ($row['voteno'] / 2)) { //If there are double the no votes than yes votes, frame is unmarked special.
            makeSpecial($row['frame'], true);
            echo $row['frame'] . "\n";
        }
    }

} catch(PDOException $e) {
    $dblog = "../data/dblog.txt"; //Stores database exceptions.
    $msg = $eventtime . "\t" . $e->getMessage() . "\n";
    file_put_contents($dblog, $msg, FILE_APPEND);
}