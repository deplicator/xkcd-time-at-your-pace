<?php
/*
 * Handles votes for or against special frames.
 */

include('../config.php');

if(isset($_REQUEST['frame']) && isset($_REQUEST['vote'])) {
    $frame = $_REQUEST['frame'];
    $vote = $_REQUEST['vote'];
    if(($vote != "voteyes" && $vote != "voteno") || !is_numeric($frame)) {
        echo "fail";
        exit(0);
    }
    $votelimit = 24; //could vote yay or nay on every frame for the past day (mass vote feature in the future).

    try {
        $DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);
        
        $ipaddress = $_SERVER["REMOTE_ADDR"];
        $STH = $DBH->query("SELECT votes, timestamp FROM voters WHERE ip='$ipaddress'");
        $result = $STH->fetch();

        $datetime1 = new DateTime($result['timestamp']);
        $datetime2 = new DateTime("now");
        $now = $datetime2->format('Y-m-d H:i:s');
        $interval = $datetime1->diff($datetime2);
        $daydiff = $interval->format('%d');
        $hourdiff = $interval->format('%h');
        
        //echo intval($daydiff) . intval($hourdiff);
        
        if(intval($daydiff) > 0 || intval($hourdiff) > 22) {
            $STH = $DBH->prepare("UPDATE voters SET timestamp=?, votes=? WHERE ip=?");
            $STH->execute(array($now, 1, $ipaddress));
            echo "success";
            
        } else if($result['votes'] < $votelimit) {
            $STH = $DBH->prepare("UPDATE votes SET $vote=$vote+1 WHERE frame=?");
            $STH->execute(array($frame));
            
            $STH = $DBH->prepare("INSERT INTO voters (timestamp, votes, ip) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE votes=votes+1");
            
            $STH->execute(array($now, 1, $ipaddress));
            
            echo "success";
        } else {
            echo "fail";
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


















