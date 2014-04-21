<?php

class Controller_Register extends Controller {

	private $userModel;

	public function preDispatch() {
		$this->userModel = Model::get('user');
	}
	
	public function indexAction() {

		$username = trim($this->request->post('username', ''));
		$email = trim($this->request->post('email', ''));
		$password = trim($this->request->post('password', ''));

		if($this->request->isPost()) {
			try {
				if($result = $this->userModel->register($username, $email, $password)) {
					$this->user->login($username, $password);

					$this->response->redirect($this->config->site_base_web);
				}
			}
			catch(Exception $e) {
				$this->view->error = $e->getMessage();
				$this->view->username = $username;
				$this->view->email = $email;
				$this->view->password = $password;
			}
		}
	}
}