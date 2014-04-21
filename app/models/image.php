<?php

class Model_Image extends Model {

	protected $table = 'image';

	public function getUserImages($id) {
		return $this->db->query("SELECT * FROM {$this->table} WHERE userId = ?", $id);
	}
}