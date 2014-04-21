<?php

/**
 * 
*/
abstract class Model {

	protected $table;
	protected $primaryKey;
	protected $columns;

	public static $models;
	
	public function __construct($db = null) {

		$this->db = $db;
		
		if(is_null($db)) {
			$this->db = Registry::getInstance()->db;
		}

		foreach($this->db->query("DESCRIBE {$this->table}") as $column) {

			if(is_null($this->primaryKey) && $column->Key == 'PRI') {
				$this->primaryKey = $column->Field;
			}

			$pos = strpos($column->Type, '(');
			$this->columns[$column->Field] = $pos !== false ? substr($column->Type, 0, $pos) : $column->Type;
		}

		if(is_null($this->primaryKey)) {
			$this->primaryKey = $this->table;
		}
	}

	public static function get($model) {

		if(!isset(Model::$models[$model])) {

			$base = Registry::getInstance()->config->model_base;

			// echo "Base: $base<br />\n";

			// require_once 'app/models/' . $model . '.php';
			require_once $base . $model . '.php';

			$model_class = 'Model_' . ucfirst($model);	

			if(!class_exists($model_class)) {
				throw new Exception('Model: ' . $model . ' does not exist');
			}

			Model::$models[$model] = new $model_class;
		}

		return Model::$models[$model];
	}
	
	/**
	 * 
	*/
	public function select($id, array $rows = array()) {
		$fields = $rows ? implode(',', $rows) : '*';
		//return $this->db->query("SELECT {$fields} FROM {$this->table} WHERE {$this->primaryKey} = :i: LIMIT 1", $id)->fetch();
		return $this->db->query("SELECT {$fields} FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1", $id)->fetch();
	}
	
	/**
	 * 
	*/
	public function update(array $args, $id) {

		/*$sql = array();
		
		foreach($args as $key => $val) {
			if(!isset($this->columns[$key])) {
				continue;
			}
			$sql[] = "`{$key}` = " . $this->db->escape($val, $this->columns[$key]);
		}

		return $this->db->query("UPDATE {$this->table} SET :r: WHERE {$this->primaryKey} = :i:", implode(',', $sql), $id);*/

		$sql = array();
		
		foreach($args as $key => $val) {
			if(!isset($this->columns[$key])) {
				continue;
			}
			$sql[] = "`{$key}` = ?";// . $this->db->escape($val, $this->columns[$key]);
		}

		return $this->db->query("UPDATE {$this->table} SET " . implode(',', $sql) . " WHERE {$this->primaryKey} = ?", $args, $id);
	}
	
	/**
	 * 
	*/
	public function insert(array $args) {

		$keys = array();

		foreach($args as $key => $val) {
			if(!isset($this->columns[$key])) {
				continue;
			}

			$keys['`' . $key . '`'] = $this->db->escape($val, $this->columns[$key]);
		}

		$fields = implode(',', array_keys($keys));
		$values = implode(',', array_values($keys));

		$this->db->query("INSERT INTO {$this->table} ({$fields}) VALUES ({$values})");

		return $this->db->insertId();
	}
	
	/**
	 * 
	*/
	public function delete($id) {
		return $this->db->query("DELETE FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1", $id);
	}

	public function fetchAll(array $rows = array()) {
		$fields = $rows ? implode(',', $rows) : '*';
		return $this->db->query("SELECT {$fields} FROM {$this->table}");
	}
}