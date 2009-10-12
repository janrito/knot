<?php
    $url = $_REQUEST["call"];
	header("Content-type: text/html");
    echo file_get_contents($url);
    exit;
?>