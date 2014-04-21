<?php

class Model_Page extends Model {
	
	protected $table = 'page';
	
	public function selectByFileName($name) {
		return $this->db->query("SELECT * FROM {$this->table} WHERE filename = ? LIMIT 1", $name)->fetch();
	}

	public function fetchAll(array $rows = array()) {
		$fields = $rows ? implode(',', $rows) : '*';
		return $this->db->query("SELECT {$fields} FROM {$this->table}
			JOIN template ON (template = templateId)");
	}
}