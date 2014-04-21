<?php

class User {

	private $db;
	private $user;

	// private $salt = '';
	
	public function __construct() {
		$this->db = Registry::getInstance()->db;

		$userId = isset($_SESSION['user']) ? $_SESSION['user'] : 0;

		if($userId) {
			$this->user = $this->fetch($userId);
		}
	}

	public function login($username, $password) {
		
		require_once 'app/libraries/bcrypt.php';

		$result = $this->db->query('SELECT id, username, email, password FROM user WHERE (username = ? OR email = ?)', $username, $username)->fetch();

		if($result && Bcrypt::checkPassword($password, $result['password'])) {

			$this->user = $result;
			$_SESSION['user'] = $this->user['id'];

			return true;
		}

		return false;
	}

	/*
	 * 
	*/
	public function isLoggedIn() {
		return isset($this->user['id']) && intval($this->user['id']) > 0;
	}

	public function fetch($id) {
		$data = $this->db->query('SELECT id, username, email FROM user WHERE id = ? LIMIT 1', $id)->fetch();

		if(!$data) {
			return false;
		}

		return $data;
	}

	public function logout() {
		$_SESSION['user'] = null;
	}

	public function hash($string) {
		return $string;
	}

	public function get($key) {
		return isset($this->user[$key]) ? $this->user[$key] : null;
	}

	public function __get($key) {
		return $this->get($key);
	}

	/*private function encrypt($text) {
		return $text . $this->salt;
	}*/
}