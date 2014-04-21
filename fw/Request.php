<?php

/*
 * 
*/
class Request {

	//private $_cookie;
	private $_files;
	private $_get;
	private $_post;
	private $_server;
	private $_session;
	
	/*
	 * 
	*/
	public function __construct() {

		if (get_magic_quotes_gpc() === 1) {
			$_GET = json_decode(stripslashes(json_encode($_GET, JSON_HEX_APOS)), true);
			$_POST = json_decode(stripslashes(json_encode($_POST, JSON_HEX_APOS)), true);
			$_COOKIE = json_decode(stripslashes(json_encode($_COOKIE, JSON_HEX_APOS)), true);
			$_REQUEST = json_decode(stripslashes(json_encode($_REQUEST, JSON_HEX_APOS)), true);
		}

		$this->process($_GET, $this->_get);
		$this->process($_POST, $this->_post);
		$this->process($_SERVER, $this->_server);

		//if($_COOKIE)
		//	$this->process($_COOKIE, $this->_cookie);

		if($_FILES)
			$this->process($_FILES, $this->_files);

		//echo "<pre>" . print_r($this->_server, true) . "</pre>";
	}

	public function getSiteUrl() {
		return Registry::getInstance()->config->site_base_web;
	}

	/*
	 * 
	*/
	public function isAjax() {
		return isset($this->_server['HTTP_X_REQUESTED_WITH']) && $this->_server['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
	}

	/*
	 * 
	*/
	public function isPost() {
		return count($this->_post) > 0;
	}

	/*
	 * 
	*/
	public function getIp() {
		
		if(isset($this->_server['HTTP_CLIENT_IP'])) return $this->_server['HTTP_CLIENT_IP'];
		if(isset($this->_server['HTTP_X_FORWARDED_FOR'])) return $this->_server['HTTP_X_FORWARDED_FOR'];
		
		return $this->_server['REMOTE_ADDR'];
	}

	/*
	 * 
	*/
	private function process(array &$data, &$ref) {

		$ref = array();
		
		foreach($data as $key => $val) {
			$ref[$key] = $val;
		}
	}

	/*
	 * 
	*/
	public function cookie($key, $default = null) {
		return isset($this->_cookie[$key]) ? $this->_cookie[$key] : $default;
	}

	/*
	 * 
	*/
	public function get($key, $default = null) {
		return isset($this->_get[$key]) ? $this->_get[$key] : $default;
	}

	/*
	 * 
	*/
	public function post($key, $default = null) {
		return isset($this->_post[$key]) ? $this->_post[$key] : $default;
	}

	/*
	 * 
	*/
	public function server($key, $default = null) {
		return isset($this->_server[$key]) ? $this->_server[$key] : $default;
	}
}