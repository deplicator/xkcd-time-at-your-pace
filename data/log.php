<?php
header("Content-Type: application/json", true);

include('../config.php');
include('../class.db.php');

if(isset($_REQUEST["when"])) {
    //log.php?when='2013-06-03'
    $since = $_REQUEST["when"];
} else {
    //Change this to only grab the last ~24 hours.
    $since = 0;
}

$db = new db(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS); //Connect to database.

$results = $db->select("log", "timestamp > $since");
echo json_encode($results);