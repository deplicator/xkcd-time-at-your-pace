<?php
/* 
 * updateframes.php
 * Updates data folder and database.
 */
include('config.php');
include('class.db.php');


class UpdateFrames {

    private $db;                //Database connection.
    private $link;              //Link to xkcd pic.
    private $llink;             //Local link.
    private $blink;             //Short url.
    private $hash;              //Just the hash.
    private $record_count;      //Current number of frames.
    private $new_frame;         //New frame's number.
    private $image;             //Actual image.
    private $image_time;        //Creation date of image from header.

    public function __construct() {
        $xkcdInfo = $this->getXKCDstuff('http://imgs.xkcd.com/comics/time.png');
        
        $this->link = $xkcdInfo[0];
        $this->hash = substr(end(explode("/", $this->link)), 0, -4); //Parse only hash from link.
        $this->image = $xkcdInfo[2];
        $this->image_time = $xkcdInfo[1];
        
        $this->db = new db(PDO_CONNECTION, DB_WRITE_USER, DB_WRITE_PASS); //Connect to database.
        
        //Check for new frame.
        if($this->frameCountCheck() && $this->imageHashRepeatCheck()) {
            $this->crossCheck();
            $this->createBitlyLink();
            $this->updateDatabase();
            $this->createImage();
            $this->updateDataText();
            echo "Database updated.";
        } else {
            echo "No update at this time, more information in the log.";
        }
    }
    
    /**
     * General curl function that returns data from link provided.
     */
    private function curl($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url); 
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
        $data = curl_exec($ch);
        curl_close ($ch);
        return $data;
    }

    /**
     * Returns an array where the first element is the hashed image link and the second is the date 
     * and time the file was Last-Modified: on the server (might be useful), and the last is the
     * comic image.
     */
    private function getXKCDstuff($url, $secondTry = false){
        $data = [];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_FILETIME, true);
        $response = curl_exec($ch);
        if(curl_errno($ch)) {
            echo 'Curl error: ' . curl_error($ch);
            $insert = array(
                "type" => "Unexpected Fail",
                "msg" => "Could not connect to to xkcd.com with provided link: " . $url
            );
            $this->db->insert("log", $insert);
            if(!$secondTry) {
                getXKCDstuff('http://c.xkcd.com/redirect/comic/time', true);
            }
        }
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $body = substr($response, $header_size);            
        array_push($data, curl_getinfo($ch, CURLINFO_EFFECTIVE_URL));
        array_push($data, curl_getinfo($ch, CURLINFO_FILETIME));
        array_push($data, $body);
        curl_close($ch);
        return $data;
    }

    /**
     * Number of rows in frames table should match the highest frame number found. If they do not 
     * something went wrong in a previous update.
     */
    private function frameCountCheck() {
        $sql = "SELECT COUNT(*) FROM frames"; //Number of records in frames table.
        $results = $this->db->run($sql);
        $this->record_count = $results[0]['COUNT(*)'];
        
        $sql = "SELECT MAX(frame) FROM frames"; //Highest frame number in frames table
        $results = $this->db->run($sql);
        $highest_frame = $results[0]['MAX(frame)'];

        if($this->record_count != $highest_frame) {
            $insert = array(
                "type" => "Unexpected Fail",
                "msg" => "The number of rows in the frames table do not match the highest frame number found."
            );
            $this->db->insert("log", $insert);
            return false; //Something is wrong.
        }
        return true; //Things are as expected.
    }

    /**
     * Checks database for repeat of image link.
     */
    private function imageHashRepeatCheck() {
        $sql = "SELECT * FROM frames WHERE link = '$this->link'";
        $results = $this->db->run($sql);
        foreach($results as $row) {
            $where = $row['frame'];
        }
        if(isset($where)) {
            if(date('i') <= 5) {
                $insert = array(
                    "type" => "Unexpected Fail",
                    "msg" => "Link found in database for hash " . $this->hash . " at frame " . 
                              $where . ". This is unexpected because it is within a few minutes of 
                              an expected update."
                );
                $this->db->insert("log", $insert);
                return false; //Already found in database, but logs it as unexpected because of time.
            } else {
                $insert = array(
                    "type" => "Expected Fail",
                    "msg" => "Link found in database for hash " . $this->hash . " at frame " . $where . "."
                );
                $this->db->insert("log", $insert);
                return false; //Already found in database.
            }
        } else {
            $this->new_frame = $this->record_count + 1;
            $this->llink = "http://geekwagon.net/projects/xkcd1190/data/frames/" . $this->new_frame . ".png";
            $insert = array(
                "type" => "Success",
                "msg" => "Unique frame found with hash " . $this->hash . "."
            );
            $this->db->insert("log", $insert);
            return true; //Not found in array, potential new frame.
        }
    }
    
    /**
     * Compare found hash and count with xkcd.mscha.org. This doesn't stop the update from
     * proceeding, but creates a record to manually double check. This method should only run when
     * imageHashRepeatCheck() returns true.
     */
    private function crossCheck() {
        $mschaJsonLink = "http://xkcd.mscha.org/time.json";
        $mschaJsonRaw = $this->curl($mschaJsonLink);
        $mschaJson = json_decode($mschaJsonRaw, true);
        $mschaCount = (end($mschaJson)['frameNo']);
        $mschaHash = (end($mschaJson)['hash']);

        if($this->new_frame == $mschaCount) {
            $insert = array(
                "type" => "Success",
                "msg" => "Frame count for frame " . $this->new_frame . " is the same as mscha.org."
            );
            $this->db->insert("log", $insert);
        } else {
            $insert = array(
                "type" => "Unexpected Fail",
                "msg" => "Frame count is difference from mscha.org (" . $mschaCount . ")."
            );
            $this->db->insert("log", $insert);
        }
        
        if($this->hash == $mschaHash) {
            $insert = array(
                "type" => "Success",
                "msg" => "The hash found matches mscha.org. (" . $this->hash . ")."
            );
            $this->db->insert("log", $insert);
        } else {
            $insert = array(
                "type" => "Unexpected Fail",
                "msg" => "The hash found does not match mscha.org. (" . $this->hash . ")."
            );
            $this->db->insert("log", $insert);
        }
    }
    
    /**
     * Create a short URL for new frame.
     * TODO: user general curl function.
     */
    private function createBitlyLink() {
        $ch = curl_init("http://api.bitly.com/v3/shorten?login=" . BITLY_LOGIN . "&apiKey=" . BITLY_API . "&longUrl=" . LONG_URL . $this->new_frame);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $shortURL = curl_exec($ch);
        $start = strpos($shortURL, 'http:\/\/bit.ly\/');
        $end = strpos($shortURL, '", "hash": "') - $start;
        $shortURL = substr($shortURL,$start,$end);
        $shortURL = str_replace('\\', '', $shortURL);
        
        $this->blink = $shortURL;
        
        if($this->blink) {
            $insert = array(
                    "type" => "Success",
                    "msg" => "Short url created for frame " . $this->new_frame . ". (" . $this->blink . ")."
                );
            $this->db->insert("log", $insert);
        } else {
            $insert = array(
                    "type" => "Unexpected Fail",
                    "msg" => "Short url not created for frame " . $this->new_frame . "."
                );
            $this->db->insert("log", $insert);
        }
    }
    
    /**
     * Put it all in the database.
     */
    private function updateDatabase() {
        //Update frames table.
        $insert = array(
                "frame" => $this->new_frame,
                "link" => $this->link,
                "llink" => $this->llink,
                "blink" => $this->blink
            );
        $this->db->insert("frames", $insert);
        
        //Update votes table.
        $insert = array(
                "frame" => $this->new_frame,
                "voteyes" => 0,
                "voteno" => 0
            );
        $this->db->insert("votes", $insert);
        
        //Update log table.
        $insert = array(
                    "type" => "Success",
                    "msg" => "Record entered into database for frame " . $this->new_frame . "."
                );
        $this->db->insert("log", $insert);
    }
    
    /**
     * Create local copy of image.
     */
    private function createImage() {
        $newImageloc = './data/frames/' . $this->new_frame . '.png';
        if(file_exists($newImageloc)) {
            $insert = array(
                        "type" => "Unexpected Fail",
                        "msg" => "Image already exists at " . $newImageloc . ".png."
                    );
            $this->db->insert("log", $insert);
        } else {
            $newImage = imagecreatefromstring($this->image);
            imagepng($newImage, $newImageloc);
            if(file_exists($newImageloc) && filesize($newImageloc) != 0) {
                $insert = array(
                            "type" => "Success",
                            "msg" => "Image copied to " . $newImageloc . ".png."
                        );
                $this->db->insert("log", $insert);
            } else {
                $insert = array(
                            "type" => "Unexpected Fail",
                            "msg" => "Image did not copy to " . $newImageloc . ".png."
                        );
                $this->db->insert("log", $insert);
            }
        }
    }
    
    /**
     * Update data.txt.
     */
    private function updateDataText() {
        $data = "./data/data.txt"; //Stores link to frames in simple text.
        $dataContents = file($data);
        
        if(count($dataContents) == $this->new_frame) {
            file_put_contents($data, "\n" . $this->link, FILE_APPEND);
            $insert = array(
                        "type" => "Success",
                        "msg" => "Updated data.txt with frame " . $this->new_frame . "."
                    );
            $this->db->insert("log", $insert);
        } else {
            $insert = array(
                        "type" => "Unexpected Fail",
                        "msg" => "Frame " . $this->new_frame . " does not match data.txt"
                    );
            $this->db->insert("log", $insert);
        }
    }
}

$now = new updateframes();
