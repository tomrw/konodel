<?php

class Config {

	private $config;
	
	public function __construct() {
		$this->config = array();
	}

	/*
	 * Read and parse a config file
	 * @param $file
	*/
	public function loadConfig($file) {

		$config = parse_ini_file($file);

		if(!$config) return;

		foreach($config as $config_name => $config_data) {
			$this->config[$config_name] = $config_data;
		}
	}

	/*
	 * 
	*/
	public function __set($key, $value) {
		$this->config[$key] = $value;
	}

	/*
	 * 
	*/
	public function __get($key) {
		
		if(!isset($this->config[$key])) {
			return null;
		}

		return $this->config[$key];
	}

	public function __toString() {
		return print_r($this->config, true);
	}
}