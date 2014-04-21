<?php

class Controller_Login extends Controller {

	public function indexAction() {

		$username = $this->request->post('username', '');
		$password = $this->request->post('password', '');

		if($username && $password) {

			if($this->user->login($username, $password)) {
				$this->response->redirect($this->config->site_base_web);
			}
			else {
				$this->view->login_error = 'Invalid Credentials';
			}
		}
	}
}