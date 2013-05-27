<?php
header("Content-Type: application/json", true);

//Caching: http://www.theukwebdesigncompany.com/articles/php-caching.php
$cachefile = "data/cache.json";
$cachetime = 10 * 60; // 10 minutes

// Serve from the cache if it is younger than $cachetime
if (file_exists($cachefile) && (time() - $cachetime < filemtime($cachefile))) {
    readfile($cachefile);
    exit;
}
ob_start(); // start the output buffer

include('./config.php');
$confobject = array('updatetime' => date(DATE_W3C));
//display what's in the frames table
try {
    $DBH = new PDO(PDO_CONNECTION, DB_READ_USER, DB_READ_PASS);
    // Debating combining votes table with frames table, but I'm inclined to keep them seperate so
    // we're not writing to the frames table as much. Started discuccion with issue #57.
    $STH = $DBH->query('
        SELECT frames.frame, link, llink, blink,
        votes.voteyes AS \'yes\', votes.voteno AS \'no\',
        (2 * voteyes > voteno && voteyes + voteno > 10) AS \'special\'
        FROM frames, votes 
        WHERE frames.frame = votes.frame');
    $STH->setFetchMode(PDO::FETCH_ASSOC);
    echo "[".json_encode($confobject);
    while($row = $STH->fetch()) {
        echo ",";
        //Warning: will only work, if column names and object-attribute names are consistent!
        echo json_encode($row);
    }
    echo "]";

} catch(PDOException $e) {
    $dblog = "./data/dblog.txt"; //Stores database exceptions.
    file_put_contents($dblog, $eventtime . "\t" . $e->getMessage() . "\n", FILE_APPEND);
}

$fp = fopen($cachefile, 'w'); 
// save the contents of output buffer to the file
fwrite($fp, ob_get_contents());
// close the file
fclose($fp); 
// Send the output to the browser
ob_end_flush();