<?php

class View_Helper_Config {

	private $config;

	public function __construct() {
		$this->config = Registry::getInstance()->config;
	}
	
	public function __get($key) {
		return $this->config->$key;
	}
}