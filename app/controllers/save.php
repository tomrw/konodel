<?php

class Controller_Save extends Controller {

	protected $imageModel;
	protected $layerModel;

	public function preDispatch() {
		$this->imageModel = Model::get('image');
		$this->layerModel = Model::get('layer');
	}
	
	public function indexAction() {

		$result = array();

		if(!$this->request->isAjax()) {
			$result['success'] = false;
			$result['message'] = 'Invalid Request';

			return json_encode($result);
		}

		if(!$this->user->isLoggedIn()) {
			$result['success'] = false;
			$result['message'] = 'Not Logged In';

			return json_encode($result);
		}

		$data = json_decode($this->request->post('data'), true);

		$imageId = isset($data['id']) ? intval($data['id']) : 0;
		$name = isset($data['name']) ? $data['name'] : '';
		$desc = isset($data['desc']) ? $data['desc'] : '';
		$width = isset($data['width']) ? intval($data['width']) : 0;
		$height = isset($data['height']) ? intval($data['height']) : 0;
		$layers = isset($data['layers']) ? $data['layers'] : array();
		$publish = isset($data['publish']) ? $data['publish'] : false;

		// Image Data
		$thumb = isset($data['thumb']) ? $data['thumb'] : false;
		$fullsize = isset($data['fullsize']) ? $data['fullsize'] : false;
		$display = isset($data['display']) ? $data['display'] : false;

		if(strlen($name) > 100) {
			$result['success'] = false;
			$result['message'] = 'The image name you provided is too long';

			return json_encode($result);
		}

		if(!count($layers)) {
			$result['success'] = false;
			$result['message'] = 'This image has no layers';

			return json_encode($result);
		}

		if($imageId && $imageData = $this->imageModel->select($imageId, array('userId'))) {

			if($imageData['userId'] != $this->user->id) {
				$result['success'] = false;
				$result['message'] = 'This image does not belong to you';

				return json_encode($result);
			}

			$this->imageModel->update(array(
				'published'		=> $publish,
				'name'			=> $name,
				'description'	=> $desc,
				'width'			=> $width,
				'height'		=> $height
			), $imageId);

			$this->layerModel->removeImageLayers($imageId);
		}
		else {

			$imageId = $this->imageModel->insert(array(
				'userId' 		=> $this->user->id,
				'published' 	=> $publish ? 1 : 0,
				'name' 			=> $name,
				'description'	=> $desc,
				'width'			=> $width,
				'height'		=> $height,
				'url' 			=> ''
			));
		}

		foreach($layers as $layer) {
			if(!isset($layer['name']) || !isset($layer['data']) || !isset($layer['opacity']) || !isset($layer['order'])) {
				continue;
			}

			$layerData = str_replace(' ', '+', $layer['data']);

			$layerId = $this->layerModel->insert(array(
				'content'	=> $layerData,
				'imageId'	=> $imageId,
				'name'		=> $layer['name'],
				'opacity'	=> $layer['opacity'],
				'order'		=> $layer['order']
			));
		}

		if($thumb) {
			$this->createImage($thumb, $this->config->thumb_dir . $imageId . '-thumb.png');
		}

		if($publish) {
			if($display) {
				$this->createImage($display, $this->config->display_dir . $imageId . '-display.png');
			}

			if($fullsize) {
				$this->createImage($display, $this->config->fullsize_dir . $imageId . '-fullsize.png');
			}
		}

		// Create image
		// Create layer

		$result['success'] = true;
		$result['message'] = 'Image Saved';
		$result['imageId'] = $imageId;

		return json_encode($result);
	}

	private function createImage($data, $location) {
		$data = substr($data, strpos($data, ',') + 1);
		$data = str_replace(' ', '+', $data);
		$data = base64_decode($data);

		file_put_contents($location, $data);
	}
}