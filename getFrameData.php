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
//display what's in the frames table
try {
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_READ_USER, DB_READ_PASS);
            
    $STH = $DBH->query("SELECT frame, link, llink, blink FROM `frames`");
    $STH->setFetchMode(PDO::FETCH_ASSOC);
    echo "[{}";
    while($row = $STH->fetch()) {
        echo ",";
        echo json_encode($row); //Warning: will only work, if column names and object-attribute names are consistent!
    }
    echo "]";

} catch(PDOException $e) {
    $dblog = "./data/dblog.txt"; //Stores database exceptions.
    echo $eventtime . "\t" . $e->getMessage() . "\n";
    file_put_contents($dblog, $eventtime . "\t" . $e->getMessage() . "\n", FILE_APPEND);
}


$fp = fopen($cachefile, 'w'); 
// save the contents of output buffer to the file
fwrite($fp, ob_get_contents());
// close the file
fclose($fp); 
// Send the output to the browser
ob_end_flush(); 

/*database: xkcd1190ayop
 *
 * table:   frames
 * rows:    frame   frame number of image
 *          link    link to xkcd image
 *          llink   link to local image
 *          blink   link to bitly short url
 *
 * table:   votes
 * rows:    frame (one to one)
 *          voteyes yes votes for special frame
 *          voteno  no votes for special frame
 * 
 * table:   pxstats
 * rows:    frame (one to many)
 *          number of pixels for each hexadecimal color found in frame
 *          this table could be huge, but cool
 */

?>
