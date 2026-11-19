<?php
require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/../src/Config/database.php';
//get the env variables
?>


    <!-- testing -->

    <p>Database Name: <?php echo $dbName; ?></p>
    <p>Database User: <?php echo $dbUser; ?></p>
    <p>Database Password: <?php echo $dbPass; ?></p>
    <p>Database Root Password: <?php echo $dbRootPass; ?></p>   

