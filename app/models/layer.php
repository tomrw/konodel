<?php

class Model_Layer extends Model {
	
	protected $table = 'layer';

	public function selectImageLayers($id) {
		return $this->db->query("SELECT * FROM {$this->table} WHERE imageId = ?", $id);
	}

	public function removeImageLayers($id) {
		return $this->db->query("DELETE FROM {$this->table} WHERE imageId = ?", $id);
	}
}