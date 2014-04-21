<?php

class Controller_Logout extends Controller {
	
	public function indexAction() {

		$this->user->logout();
		$this->response->redirect($this->config->site_base_web);
	}
}