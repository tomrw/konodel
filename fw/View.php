<?php

/*
 * 
*/
class View {

	private $config;
	private $base_path;

	private static $helpers = array();

	public function __construct() {
		$this->config = Registry::getInstance()->config;
		$this->base_path = $this->config->view_base;
	}
	
	public function render($file) {

		if(!file_exists($this->base_path . $file)) {
			throw new Exception('View File: ' . $this->base_path . $file . ' not found');
		}

		ob_start();

		include $this->base_path . $file;

		$contents = ob_get_contents();
		
		ob_end_clean();

		return $contents;
	}

	public function setBasePath($path) {
		$this->base_path = $path;
	}

	public function helper($helper) {

		$helper = ucfirst(strtolower($helper));

		if(!isset(View::$helpers[$helper])) {

			if(file_exists('View/Helper/' . $helper . '.php')) {
				throw new Exception("View Helper '$helper' does not exist");
			}

			$helper_class = 'View_Helper_' . ucfirst($helper);

			if(!class_exists($helper_class)) {
				throw new Exception("View Helper '$helper' does not exist");
			}

			View::$helpers[$helper] = new $helper_class;
		}

		return View::$helpers[$helper];
	}

	public static function getHelper($helper) {
		$helper = ucfirst(strtolower($helper));
		return isset(View::$helpers[$helper]) ? View::$helpers[$helper] : null;
	}
}