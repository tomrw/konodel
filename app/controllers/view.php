<?php

class Controller_View extends Controller {

	protected $model;

	public function preDispatch() {
		$this->model = Model::get('image');
	}
	
	public function indexAction() {

		$id = $this->request->get('id', 0);

		if($id && ($data = $this->model->select($id)) && $data['published']) {

			$display = $this->config->display_dir . $id . '-display.png';
			$fullsize = $this->config->fullsize_dir . $id . '-fullsize.png';

			$this->view->display = file_exists($display) ? $display : false;
			$this->view->fullsize = file_exists($fullsize) ? $fullsize : false;
			$this->view->base = $this->config->site_base_web;
			$this->view->name = $this->escapeHTML($data['name']);
			$this->view->description = $this->escapeHTML($data['description']);
		}
		else {
			$this->response->setHttpStatus(404);
		}
	}

	private function escapeHTML($string) {
		return htmlspecialchars($string);
	}
}