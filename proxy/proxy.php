<?php
    $real_proxy = "http://monk:bernardo@monk.lis.uiuc.edu:8888/monkmiddleware/";
	//$real_proxy = "http://florencia.local:8888/workspace/rpr/trunk/testdata.xml";
    $url = "{$real_proxy}{$_REQUEST["call"]}?{$_SERVER["QUERY_STRING"]}";
    //$url = $real_proxy;
	header("Content-type: text/xml");
    echo file_get_contents($url);
    exit;
?>