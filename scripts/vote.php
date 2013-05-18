<?php
/*
 * Handles votes for or against special frames.
 */

include('../config.php');

if(isset($_REQUEST['frame'])) {
    $frame = $_REQUEST['frame'];
    $vote = $_REQUEST['vote'];
    $votelimit = 10; //set low for testing

    try {
        $DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);
        
        $ipaddress = $_SERVER["REMOTE_ADDR"];
        $STH = $DBH->query("SELECT `votes`, `timestamp` FROM `voters` WHERE `ip`=\"$ipaddress\"");
        $result = $STH->fetch();

        $datetime1 = new DateTime($result['timestamp']);
        $datetime2 = new DateTime("now");
        $interval = $datetime1->diff($datetime2);
        $diff = $interval->format('%R%a days');
        
        if(intval($diff) > 0) {
            $STH = $DBH->prepare("UPDATE voters SET votes=1 WHERE `ip`=\"$ipaddress\"");
            $STH->execute(array($frame));
            echo 1;
            
        } else if($result['votes'] < $votelimit) {
            $STH = $DBH->prepare("UPDATE votes SET $vote=$vote+1 WHERE frame=?");
            $STH->execute(array($frame));
            
            $STH = $DBH->prepare("INSERT INTO voters (votes, ip) VALUES (1, ?) ON DUPLICATE KEY UPDATE votes=votes+1");
            $STH->execute(array($ipaddress));
            
            echo 1;
        } else {
            echo 0;
        }

    } catch(PDOException $e) {
        $dblog = "../data/dblog.txt"; //Stores database exceptions.
        $msg = $eventtime . "\t" . $e->getMessage() . "\n";
        file_put_contents($dblog, $msg, FILE_APPEND);
    }
} else {
    header("Content-Type: application/json", true);
    try {
        $DBH = new PDO(PDO_CONNECTION, DB_READ_USER, DB_READ_PASS);

        $STH = $DBH->query("SELECT * FROM votes");
        $STH->setFetchMode(PDO::FETCH_ASSOC);
        echo "[{}";
        while($row = $STH->fetch()) {
            echo ",";
            echo json_encode($row); //Warning: will only work, if column names and object-attribute names are consistent!
        }
        echo "]";

    } catch(PDOException $e) {
        $dblog = "../data/dblog.txt"; //Stores database exceptions.
        $msg = $eventtime . "\t" . $e->getMessage() . "\n";
        file_put_contents($dblog, $msg, FILE_APPEND);
    }
}


















