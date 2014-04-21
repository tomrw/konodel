<?php

if(!isset($_GET['type']) && !isset($_GET['files'])) {
	die();
}

$debug = true;
$files = array();
$cache_dir = 'assets/cache/';
$name = '';

if($_GET['type'] == 'js') {
	require_once 'app/libraries/jsmin.php';
	header('Content-type: text/javascript');
	$dir = 'assets/js/';
	$extension = 'js';
}
else {
	header('Content-type: text/css');
	require_once 'app/libraries/cssmin.php';
	$dir = 'assets/css/';
	$extension = 'css';
}

foreach(explode(',', $_GET['files']) as $file) {

	$parts = explode('.', $file);

	if(end($parts) != $extension) {
		continue;
	}

	if(!file_exists($dir . $file)) {
		continue;
	}

	$files[] = $file;
	$name .= $file;
}

if(!$name) {
	die();
}

$cachedfile = md5($name) . '.' . $extension;
$contents = '';

// If debug is on, we want to check if a file exists with this name, and return it, otherwise generate it and save it to that file

if(!$debug) {
	if(file_exists($cache_dir . $cachedfile)) {
		die(file_get_contents($cache_dir . $cachedfile));
	}

	foreach($files as $file) {

		$parts = explode('.', $file);
		
		if($parts[count($parts) - 2] == 'min') {
			$contents .= file_get_contents($dir . $file);
		}
		else {
			$contents .= Minifier::minify(file_get_contents($dir . $file));
		}
	}

	file_put_contents($cache_dir . $cachedfile, $contents);
	die($contents);
}

// Debug is off, so just generate and return the data

foreach($files as $file) {

	$parts = explode('.', $file);
	
	if($parts[count($parts) - 2] == 'min') {
		$contents .= file_get_contents($dir . $file);
	}
	else {
		$contents .= file_get_contents($dir . $file);
	}
}

die($contents);
