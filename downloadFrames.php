<?php
/* 
 * downloadFrames.php
 * Downloads frames from the public site to mirror locally
 */

header('Content-Type: text/plain');
include('config.php');

$DBH = new PDO(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS);

$findFrame = $DBH->prepare('SELECT * FROM frames WHERE frame = ?');
$insertFrame = $DBH->prepare('INSERT INTO Frames (`update`, `frame`, `link`, `llink`, `blink`, `special`) VALUES (FROM_UNIXTIME(?), ?, ?, ?, ?, ?)');
$findVote = $DBH->prepare('SELECT * FROM votes WHERE frame = ?');
$insertVote = $DBH->prepare('INSERT INTO votes (`frame`, `voteyes`, `voteno`) VALUES (?, 0, 0)');

$frames = json_decode(file_get_contents("http://xkcd.mscha.org/time.json"), true);

if (!$frames)
	die("Frame data not valid!\n\n");
	
foreach ($frames as $frame) {
	// Ugh, ensure it's a int, some frames end in an a?
	$frame['frameNo'] += 0;

	echo "\r";
	echo str_pad("", 80, " ");
	echo "\r";
	
	echo "Processing {$frame['frameNo']}... ";
	
	if ($frame['frameNo'] == 1)
		$frame['hash'] = 1;
	$frame['path'] = "./data/frames/{$frame['frameNo']}.png";
	$frame['llink'] = "http://geekwagon.net/projects/xkcd1190/data/frames/{$frame['frameNo']}.png";
	$frame['blink'] = "";
	$frame['special'] = 0;
	$frame['dateTime'] = strtotime($frame['dateTime']);
	
	if (!file_exists($frame['path'])) {
		echo "Downloading... ";
		$fp = fopen($frame['path'], 'w');
		$ch = curl_init($frame['downloadedUrl']);
		curl_setopt($ch, CURLOPT_FILE, $fp);
		$data = curl_exec($ch);
		curl_close($ch);
		fclose($fp);
		chmod($frame['path'], 0444);
	}
	
	$findFrame->execute(array($frame['frameNo']));
	$res = $findFrame->fetch(PDO::FETCH_ASSOC);
	
	if (!$res) {
		echo "Inserting... ";
		
		$data = array($frame['dateTime'],
					  $frame['frameNo'],
					  $frame['downloadedUrl'],
					  $frame['llink'],
					  $frame['blink'],
					  $frame['special']);
		$res = $insertFrame->execute($data);
	}
	
	$findVote->execute(array($frame['frameNo']));
	$res = $findVote->fetch(PDO::FETCH_ASSOC);
	
	if (!$res) {
		echo "Votes... ";
		
		$data = array($frame['frameNo']);
		$res = $insertVote->execute($data);
	}
}

echo "\n\n";
