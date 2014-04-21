<?php

/**
 * 
*/
class Db_Update extends Db_Query {
	
	private $table;
	private $data;

	public function __construct($table) {
		$this->table = '';

	}

	/**
	 * 
	*/
	public function arg($key, $value) {
		$this->data[$key] = $value;
		return $this;
	}

	public function build() {

		return "UPDATE {$this->table} SET "
			. $this->renderArgs()
			. $this->renderWhere();
	}

	/**
	 * 
	*/
	private function renderArgs() {

		$data = '';

		foreach($this->data as $key => $value) {
			$data .= "{$key} = {$value}, ";
		}

		return $data;
	}
}