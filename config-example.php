<?php
/*
 * Database creditals. You probably don't need to break it up into two users.
 */
define("DB_HOST", "localhost");
define("DB_NAME", "xkcd1190ayop");
define("DB_WRITE_USER", "your write user");
define("DB_WRITE_PASS", "your write user password");
define("DB_READ_USER", "your read user");
define("DB_READ_PASS", "your read user password");

/*
 * For Bitly API user names and secret keys, you'll need to use your own bitly account. Once you are
 * logged in this site, https://bitly.com/a/your_api_key can give you the information to put below.
 *
 * Then rename this file to config.php.
 */

define("BITLY_LOGIN",   "bitly Username");
define("BITLY_API",     "bitly API Key");