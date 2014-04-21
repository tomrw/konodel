<?php

class Controller_Upload extends Controller {

	public function indexAction() {

		$result = array();
		$result['success'] = false;
		$file = isset($_FILES['file']) ? $_FILES['file'] : null;

		if(!$file) {
			$result['message'] = 'No image uploaded';

			return json_encode($result);
		}

		if($file['error'] != 0) {
			$result['message'] = 'There was an error uploading the image';

			return json_encode($result);
		}

		$name = strtolower($file['name']);

		if(!$this->hasValidType($name)) {
			$result['message'] = 'Please upload an image file (jpg, png or gif)';

			return json_encode($result);
		}

		if(!$imageData = $this->isImage($file['tmp_name'])) {
			$result['message'] = 'Please upload a valid image';

			return json_encode($result);
		}

		$newName = $this->generateName($name);
		$location = $this->config->uploaded_dir . $newName;

		if(!@move_uploaded_file($file['tmp_name'], $location)) {
			$result['message'] = 'There was an error uploading the image';

			return json_encode($result);
		}

		$result['success'] = true;
		$result['message'] = $location;
		$result['width'] = $imageData[0];
		$result['height'] = $imageData[1];

		return json_encode($result);
	}

	/**
	 * Check the file uploaded has a valid extension
	*/
	private function hasValidType($name) {

		$parts = explode('.', $name);
		$ext = end($parts);
		$extensions = array('jpeg', 'jpg', 'png', 'gif');

		return in_array($ext, $extensions);
	}

	/**
	 * Check the file uploaded is a valid image
	*/
	private function isImage($data) {

		if(filesize($data) < 10) return false;

		$imageData = @getimagesize($data);
		return ($imageData[2] ? $imageData : false);
	}

	/**
	 * Generate a random file name for the image
	*/
	private function generateName($name) {

		$dir = $this->config->uploaded_dir;
		$id = mt_rand(999, 999999);

		$parts = explode('.', $name);
		$ext = end($parts);

		$name = 'image-' . $id . '.' . $ext;

		while(file_exists($dir . $name)) {
			$id = mt_rand(999, 999999);
			$name = 'image-' . $id . '.' . $ext;
		}

		return $name;
	}
}