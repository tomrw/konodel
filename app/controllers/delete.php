<?php

class Controller_Delete extends Controller {

	protected $imageModel;
	protected $layerModel;

	public function preDispatch() {
		$this->imageModel = Model::get('image');
		$this->layerModel = Model::get('layer');

		$result = array();

		if(!$this->request->isAjax()) {
			$result['success'] = false;
			$result['message'] = 'Invalid Request';

			die(json_encode($result));
		}

		if(!$this->user->isLoggedIn()) {
			$result['success'] = false;
			$result['message'] = 'Not Logged In';

			die(json_encode($result));
		}
	}
	
	public function indexAction() {
		
		$result = array();
		$id = intval($this->request->post('id', 0));
		
		if(!$id || !$data = $this->imageModel->select($id)) {
			$result['success'] = false;
			$result['message'] = 'This image does not exist';

			die(json_encode($result));
		}

		if($data['userId'] != $this->user->id) {
			$result['success'] = false;
			$result['message'] = 'This image does not belong to you';

			return json_encode($result);
		}

		$this->imageModel->delete($id);
		$this->layerModel->removeImageLayers($id);

		$display = $this->config->display_dir . $id . '-display.png';
		$fullsize = $this->config->fullsize_dir . $id . '-fullsize.png';
		$thumb = $this->config->thumb_dir . $id . '-thumb.png';

		if(file_exists($display)) {
			@unlink($display);
		}

		if(file_exists($fullsize)) {
			@unlink($fullsize);
		}

		if(file_exists($thumb)) {
			@unlink($thumb);
		}

		$result['success'] = true;
		$result['message'] = 'Image Deleted';

		die(json_encode($result));
	}
}