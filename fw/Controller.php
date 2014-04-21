<?php

/*
 * 
*/
abstract class Controller {

	protected $config;
	protected $db;
	protected $request;
	protected $response;
	protected $user;

	protected $view;
	protected $action;
	protected $model;
	
	public function __construct() {

		$registry = Registry::getInstance();

		$this->config = $registry->config;
		$this->db = $registry->db;
		$this->request = $registry->request;
		$this->response = $registry->response;
		$this->user = new User();

		$controller = $this->request->get('controller') ? strtolower($this->request->get('controller')) : 'index';

		$this->view = new View();
		$this->view->user = $this->user;
		$this->view->setBasePath('app/views/controllers/' . $controller . '/');
	}

	public function dispatch() {

		$action = $this->getAction() . 'Action';

		if(!method_exists($this, $action)) {
			throw new Exception('Method ' . $action . ' does not exist');
		}

		$this->preDispatch();
		$content = $this->$action();
		$this->postDispatch();

		if(is_null($content)) {
			$content = $this->view->render($this->getAction() . '.php');
		}

		return $content;
	}

	/*
	 * 
	*/
	public function preDispatch() {

	}

	/*
	 * 
	*/
	public function postDispatch() {

	}

	/*
	 * 
	*/
	public function redirect($params = array(), $action = '', $controller = '') {
		$this->response->redirect(buildUrl($params, $action, $controller));
	}

	/*
	 * 
	*/
	private function getAction() {

		if(is_null($this->action)) {
			$this->action = trim($this->request->get('action', ''));

			if(!$this->action) {
				$this->action = 'index';
			}
		}

		return $this->action;
	}
}