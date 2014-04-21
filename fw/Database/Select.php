<?php

/**
 * 
*/
class Database_Select extends Database_Query {
	
	private $from;
	private $fields;
	private $joins;

	public function __construct($table, array $fields = array()) {
		$this->joins = array();
		$this->wheres = array();
		$this->orWheres = array();

		$this->group = '';
		$this->limit = '';
		$this->order = '';

		$this->from = $table;
		$this->fields = array($table . '.*');

		if($fields) {
			$this->fields = $fields;
		}
	}

	/**
	 * Select data from a table
	 * @param string $table
	 * @param array $fields
	*/
	/*public function from($table, array $fields = array()) {

		$this->from = $table;
		$this->fields = array($table . '.*');

		if($fields) {
			$this->fields = $fields;
		}

		return $this;
	}*/

	/**
	 * Add some columns to the SQL Query
	 * @param array $columns
	*/
	public function columns(array $columns) {

		if($columns) {
			foreach($columns as $column) {
				if(!in_array($column, $this->fields)) {
					$this->fields[] = $column;
				}
			}
		}

		return $this;
	}

	/**
	 * Add a JOIN to the SQL statement
	 * @param string $table
	 * @param mixed $join
	 * @param array $columns optional
	*/
	public function join($table, $join, array $columns = array()) {
		
		$this->buildJoin('', $table, $join, $columns);
		return $this;
	}

	/**
	 * Add a LEFT JOIN to the SQL statement
	 * @param string $table
	 * @param mixed $join
	 * @param array $columns optional
	*/
	public function leftJoin($table, $join, array $columns = array()) {
		
		$this->buildJoin('LEFT', $table, $join, $columns);
		return $this;
	}

	/**
	 * Add a RIGHT JOIN to the SQL statement
	 * @param string $table
	 * @param mixed $join
	 * @param array $columns optional
	*/
	public function rightJoin($table, $join, array $columns = array()) {
		
		$this->buildJoin('RIGHT', $table, $join, $columns);
		return $this;
	}

	/**
	 * Build a inner / left / join
	 * @param string $type
	 * @param string $table
	 * @param mixed $join
	 * @param array $columns
	*/
	private function buildJoin($type, $table, $join, $columns) {

		if(is_array($join)) {
			if(count($join) > 2) {
				throw new Exception('JOIN using 3 or more params not supported');
			}

			$this->joins[] = "{$type} JOIN {$table} ON ({$join[0]} = {$join[1]})";
		}
		else {
			$this->joins[] = "{$type} JOIN {$table} USING ({$join})";
		}

		$this->columns($columns);
	}

	public function build() {

		return "SELECT " . implode(',', $this->fields) . " FROM {$this->from} "
			. implode(' ', $this->joins)
			. $this->renderWhere()
			. $this->group . ' '
			. $this->order . ' '
			. $this->limit;
	}
}