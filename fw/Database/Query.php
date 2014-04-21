<?php

require_once 'IQuery.php';

abstract class Database_Query implements IQuery {

	protected $wheres;
	protected $where;

	protected $group;
	protected $limit;
	protected $order;

	/**
	 * 
	*/
	public function where($condition) {
		$this->buildWhere($this->buildQuery($condition, func_get_args()), true);
		return $this;
	}

	/**
	 * 
	*/
	public function orWhere($condition) {
		$this->buildWhere($this->buildQuery($condition, func_get_args()), false);
		return $this;
	}

	/**
	 * Add a GROUP clause to the SQL statement
	 * @oaram mixed $field
	*/
	public function group($field) {
		if(is_array($field)) {
			$this->group = "GROUP BY " . implode(',', $field);
		}
		else {
			$this->group = "GROUP BY {$field}";
		}

		return $this;
	}

	/**
	 * Add a LIMIT clause to the SQL statement
	 * @param int $amount
	 * @param int $offset optional
	*/
	public function limit($amount, $offset = null) {
		if(is_null($offset)) {
			$this->limit = "LIMIT {$amount}";
		}
		else {
			$this->limit = 'LIMIT ' . intval($amount) . ', ' . intval($offset);
		}

		return $this;
	}

	/**
	 * Add an ORDER clause to the SQL statement
	 * @param mixed $fields
	*/
	public function order($fields) {
		if(is_array($fields)) {
			$this->order = implode(',', $fields);
		}
		else {
			$this->order = $fields;
		}

		return $this;
	}

	/**
	 * Build a query
	 * @param string $condition
	 * @param array  $args
	*/
	private function buildQuery($condition, array $args) {
		$i = 0;
		$index = 1;
		$len = strlen($condition);

		while($i < $len && ($i = strpos($condition, ':', $i))) {
			
			if(!isset($condition[$i + 2]) || $condition[$i + 2] != ':') {
				throw new Exception('Invalid placeholder at ' . $i);
			}

			if(!isset($args[$index])) {
				throw new Exception('Expecting input at ' . $index);
			}

			$replace = $args[$index];

			switch($condition[$i + 1]) {
				case 's': $replace = "'" . mysql_real_escape_string($replace) . "'"; break;
				case 'i': $replace = intval($replace); break;
				case 'r': break;
				case 'd': $replace = floatval($replace); break;
				default: throw new Exception('Unknown placeholder: ' . $condition[$i]);
			}

			$condition = substr($condition, 0, $i) . $replace . substr($condition, $i + 3);
			
			$i += 3;
			$index++;
		}

		return $condition;
	}

	/**
	 * Build the where clause
	 * @param string 	$condition 	
	 * @param optional 	$and 		optional
	*/
	private function buildWhere($condition, $and = true) {
		$cond = '';

		if($this->wheres) {
			if($and) {
				$cond = 'AND ';
			}
			else {
				$cond = 'OR ';
			}
		}

		if(strpos($condition, 'AND') !== false || strpos($condition, 'OR') !== false) {
			$condition = '(' . $condition . ')';
		}

		$this->wheres[] = $cond . $condition;
	}

	/**
	 * Render the where clause into SQL 
	*/
	protected function renderWhere() {
		if(!$this->wheres) {
			return '';
		}

		return "WHERE " . implode(' ', $this->wheres);
	}

	/**
	 * 
	*/
	protected function renderGroup() {
		return $this->group == '' ? '' : $this->group . ' ';
	}

	/**
	 * 
	*/
	protected function renderOrder() {
		return $this->order == '' ? '' : $this->order . ' ';
	}

	/**
	 * 
	*/
	protected function renderLimit() {
		return $this->limit == '' ? '' : $this->limit . ' ';
	}

	public function __toString() {
		return $this->build();
	}
}
