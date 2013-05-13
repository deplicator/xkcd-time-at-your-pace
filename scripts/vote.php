<?php
/*
 * Handles votes for or against special frames.
 */
include('../config.php');

if(isset($_REQUEST['frame'])) {
    $frame = $_REQUEST['frame'];
    $vote = $_REQUEST['vote'];

    try {
        $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_READ_USER, DB_READ_PASS);
        $STH = $DBH->prepare("UPDATE votes SET $vote=$vote+1 WHERE frame=$frame");
        $STH->execute();
    } catch(PDOException $e) {
        $dblog = "../data/dblog.txt"; //Stores database exceptions.
        echo $eventtime . "\t" . $e->getMessage() . "\n";
        file_put_contents($dblog, $eventtime . "\t" . $e->getMessage() . "\n", FILE_APPEND);
    }
} else {
    echo "go away";
}