<?php

class Controller_Load extends Controller {

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

		$id = intval($this->request->post('id', '0'));
		
		if(!$id || !$data = $this->imageModel->select($id)) {
			$result['success'] = false;
			$result['message'] = 'This image does not exist';

			return json_encode($result);
		}

		if($data['userId'] != $this->user->id) {
			$result['success'] = false;
			$result['message'] = 'This image does not belong to you';

			return json_encode($result);
		}
		
		$layers = $this->layerModel->selectImageLayers($id);

		$result = array();
		$result['success'] = true;
		$result['name'] = $this->escapeHTML($data['name']);
		$result['desc'] = $this->escapeHTML($data['description']);
		$result['width'] = $data['width'];
		$result['height'] = $data['height'];
		$result['publish'] = $data['published'] ? true : false;
		$result['layers'] = array();

		foreach($layers as $layer) {
			$temp = array(
				'name'		=> $this->escapeHTML($layer->name),
				'data'		=> $layer->content,
				'opacity'	=> $layer->opacity,
				'order'		=> $layer->order
			);

			$result['layers'][] = $temp;
		}

		return json_encode($result, true);
	}

	public function allAction() {

		$result = array();

		$images = $this->imageModel->getUserImages($this->user->id);
		$result['success'] = true;
		$result['images'] = array();

		foreach($images as $image) {

			$thumb = $this->config->thumb_dir . $image->imageId . '-thumb.png';

			if(file_exists($thumb)) {
				$size = getimagesize($thumb);
				$thumb = array(
					'link' 		=> $thumb,
					'width'		=> $size[0],
					'height'	=> $size[1]
				);
			}
			else {
				$thumb = false;
			}

			$result['images'][] = array(
				'id'		=> $image->imageId,
				'published'	=> $image->published,
				'name'		=> $this->escapeHTML($image->name),
				'desc'		=> $this->escapeHTML($image->description),
				'width'		=> $image->width,
				'height'	=> $image->height,
				'thumb'		=> $thumb
				// 'thumb'		=> file_exists($thumb) ? $this->config->site_base_web . $thumb : ''
			);
		}

		return json_encode($result);
	}

	private function escapeHTML($string) {
		return htmlspecialchars($string);
	}
}