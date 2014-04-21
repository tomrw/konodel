<?php

class Renderer implements Environment {

	private $cache;
	private $config;
	private $db;
	private $response;

	// private $model;
	// private $templateModel;
	
	public function __construct() {

		$registry = Registry::getInstance();

		$this->cache = Cache::getInstance();

		$this->config = $registry->config;
		$this->db = $registry->db;
		$this->response = $registry->response;
		
		// $this->model = Model::get('page');
		// $this->templateModel = Model::get('template');
	}

	/*
	 * 
	*/
	public function render($controller) {

		$controller = strtolower($controller);
		$class = 'Controller_' . ucfirst($controller);

		if(!file_exists($this->config->controller_base . $controller . '.php')) {
			$this->response->setHttpStatus(404);
			return file_get_contents($this->config->site_base_web . '404.html');
		}

		require_once $this->config->controller_base . $controller . '.php';

		try {
			$con = new $class;
			return $con->dispatch();
		}
		catch(Exception $e) {
			return file_get_contents($this->config->site_base_web . '404.html');
		}
	}

	/*
	 * 
	*/
	private function error($code) {
		$this->response->setHttpStatus($code);
		return 'Error: ' . $code . "<br />\n";
	}

	public function getConfig() {
		return $this->config;
	}

	public function getDb() {
		return $this->db;
	}

	public function getRequest() {
		return Registry::getInstance()->request;
	}
}