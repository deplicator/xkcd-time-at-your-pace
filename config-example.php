<?php
/*
 * Make changes here for your configuration then rename this file to config.php.
 * 
 * For the Bitly API you'll need to use your own bitly account. Then go to this site, 
 * https://bitly.com/a/your_api_key for your user name and secret key.
 */

//Database credentials
define("PDO_CONNECTION", "mysql:host=localhost;dbname=xkcd1190ayop");
define("DB_WRITE_USER", "your write user");
define("DB_WRITE_PASS", "your write user password");
define("DB_READ_USER", "your read user");
define("DB_READ_PASS", "your read user password");

//Bitly API
define("BITLY_LOGIN",   "bitly Username");
define("BITLY_API",     "bitly API Key");
define("LONG_URL", "http://geekwagon.net/projects/xkcd1190/?frame="); //So local testing will create the same short url.