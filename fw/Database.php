<?php

class Database {

	private $conn;

	public function __construct() {
		$this->connect();
	}

	/**
	 * 
	*/
	private function connect() {

		$config = Registry::getInstance()->config;

		try {
			$this->conn = new PDO('mysql:host=' . $config->db_host . ';dbname=' . $config->db_name, $config->db_user, $config->db_password);
			$this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch(Exception $e) {
			throw $e;
		}

		return true;
	}

	/**
	 * 
	*/
	public function query() {

		$args = func_get_args();
		$sql = array_shift($args);
		
		$res = $this->conn->prepare($sql);
		$args = $this->getArgs($args);

		try {
			$res->execute($args);
		}
		catch(Exception $e) {
			throw new Database_Exception('Error executing query: ' . $sql . "<br />\nError: " . $e->getMessage());
		}

		return new Database_Result($res);
	}

	public function build($sql) {
		$args = func_get_args();

		if(count($args) > 1) {
			//$sql = $this->buildQuery($sql, $args);
		}

		return $sql;

		// TODO: split by ?, then rebuild there.
	}

	public function getArgs(array $args) {

		$data = array();

		foreach($args as $arg) {
			if(is_array($arg)) {
				foreach($arg as $val) {
					$data[] = $val;
				}
			}
			else {
				$data[] = $arg;
			}
		}

		return $data;
	}

	/**
	 * 
	*/
	/*public function buildQuery($condition, array $args) {

		$i = 0;
		$index = 1;
		$len = strlen($condition);

		echo $condition . "<br />\n";

		//$q = $condition;
		//$diff = 0;

		//while($i < $len && ($i = strpos($condition, ':', $i))) {
		while($i < $len && ($i = strpos($condition, ':', $i))) {
			
//echo $i . " -- " . $condition[$i] . " -- " . $condition[$i + 1] . " ------- " . $condition . "<br />\n";

			if(!isset($condition[$i + 2]) || $condition[$i + 2] != ':') {
				//echo $condition . "<br />\n";
				throw new Database_Exception('Invalid placeholder at ' . $i);
				//$i++;// += 3;
				continue;
			}

			if(!isset($args[$index])) {
				throw new Database_Exception('Expecting input at ' . $index);
			}

			$replace = $args[$index];

			// echo "I: " . $i . "<br />\n";

			//$replace = str_replace(':', '', $replace);

			echo "Condition: {$condition[$i+1]}<br />\n";
			echo "Index: {$i}<br />\n";

			switch($condition[$i + 1]) {
				case 's': $replace = "'" . mysql_real_escape_string($replace) . "'"; break;
				case 'i': $replace = intval($replace); break;
				case 'r': break;
				case 'd': $replace = floatval($replace); break;
				default: throw new Database_Exception('Unknown placeholder: ' . $condition[$i]);
			}

			$condition = substr($condition, 0, $i) . $replace . substr($condition, $i + 3);
			
			$i += 3;
			$index++;
		}

		//echo "END<br />\n";

		//echo "Q: {$q}<br />\n";
		//return $q;

		return $condition;
	}*/

	/**
	 * 
	*/
	public function escape($data, $type = 'varchar') {

		if(strval($data) == '') {
			return '""';
		}

		switch($type) {
			case 'varchar':
			case 'text':
			case 'char':
			case 'date':
			case 'datetime':
			case 'timestamp':
			case 'longtext':
				return $this->conn->quote($data);
			case 'tinyint':
			case 'smallint':
			case 'mediumint':
			case 'int':
			case 'bigint':
			case 'timestamp':
				return intval($data);
			case 'decimal':
			case 'float':
			case 'double':
				return floatval($data);
			default:
				throw new Database_Exception("Cannot escape data - Type: '{$type}' is not supported");
		}
	}

	public function insertId() {
		return $this->conn->lastInsertId();
	}

	public function select($table, array $data = array()) {
		return new Database_Select($table, $data);
	}

	public function insert() {
		return new Db_Insert();
	}

	public function update($table, array $data) {
		return new Db_Update($table, $data);
	}

	public function delete() {
		return new Db_Delete();
	}
}
