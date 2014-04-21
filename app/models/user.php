<?php

require_once 'app/libraries/bcrypt.php';

class Model_User extends Model {

	protected $table = 'user';

	public function register($username, $email, $password) {

		if(!$username) {
			throw new Exception('Please supply a username');
		}
		else if(!$email) {
			throw new Exception('Please supply an email address');
		}
		else if(!$password) {
			throw new Exception('Please supply a password');
		}
		else if(!$this->validEmail($email)) {
			throw new Exception('Please supply a valid email address');
		}

		if(strlen($username) > 40) {
			throw new Exception('The username you provided is too long');
		}
		else if(strlen($email) > 60) {
			throw new Exception('The email you provided is too long');
		}

		if($this->usernameExists($username)) {
			throw new Exception('Username already exists');
		}
		else if($this->emailExists($email)) {
			throw new Exception('Email already exists');
		}

		return $this->insert(array(
			'username'	=> $username,
			'email'		=> $email,
			'password'	=> $this->encrypt($password)//,
			// 'salt'		=> $salt
		));
	}

	private function usernameExists($username) {
		$data = $this->db->query("SELECT COUNT(*) AS count FROM {$this->table} WHERE username = ?", $username)->fetch();
		return $data['count'] > 0;
	}

	private function emailExists($email) {
		$data = $this->db->query("SELECT COUNT(*) AS count FROM {$this->table} WHERE email = ?", $email)->fetch();
		return $data['count'] > 0;
	}

	private function validEmail($email) {
		return filter_var($email, FILTER_VALIDATE_EMAIL);
	}

	public function encrypt($password) {
		return Bcrypt::hashPassword($password);
	}
}