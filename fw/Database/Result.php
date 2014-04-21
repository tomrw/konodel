<?php

class Database_Result implements Iterator {

	private $resource;
	private $row;
	private $rowId;
	private $numRows;

	public function __construct($resource) {
		$this->resource = $resource;
	}

	public function fetch() {
		return $this->resource->fetch();
	}

	public function numRows() {
		if(is_null($this->numRows)) {
			$this->numRows = $this->resource->rowCount();
		}

		return $this->numRows;
	}

	public function seek($position) {
	}

	public function free() {
		mysql_free_result($this->ResourceID);
		$this->resource = null;
	}

	public function getResource() {
		return $this->resource;
	}

	public function current() {
		if(is_null($this->row) && is_null($this->rowId)) {
			$this->next();
		}

		return new Database_Result_Object($this->row);
	}

	public function key() {
		$this->current();
		return $this->rowId;
	}

	public function next() {
		$this->row = $this->fetch();

		if($this->row === false) {
			$this->row = null;
		}
		else {
			$this->rowId++;
		}
	}

	public function rewind() {
		if($this->numRows() > 0) {
			$this->seek(0);
		}
	}

	public function valid() {
		return !is_null($this->row) || (is_null($this->rowId) && $this->numRows() > 0);
	}
}
