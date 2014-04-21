<?php

class Database_Result_Object {

	private $row;

	public function __construct($row) {
		$this->row = $row;
	}

	public function toArray() {
		return $this->row;
	}

	public function get($key) {
		return $this->row[$key];
	}

	public function __get($key) {
		return $this->get($key);
	}
}