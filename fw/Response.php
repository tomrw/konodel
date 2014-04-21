<?php

class Response {

	private $headers;
	private $status;

	private $statuses = array(
		100 => 'Continue',
		101 => 'Switching Protocols',
		200 => 'OK',
		201 => 'Created',
		202 => 'Accepted',
		203 => 'Non-Authoritative Information',
		204 => 'No Content',
		205 => 'Reset Content',
		206 => 'Partial Content',
		207 => 'Multi-Status',
		300 => 'Multiple Choices',
		301 => 'Moved Permanently',
		302 => 'Found',
		303 => 'See Other',
		304 => 'Not Modified',
		305 => 'Use Proxy',
		307 => 'Temporary Redirect',
		400 => 'Bad Request',
		401 => 'Unauthorized',
		402 => 'Payment Required',
		403 => 'Forbidden',
		404 => 'Not Found',
		405 => 'Method Not Allowed',
		406 => 'Not Acceptable',
		407 => 'Proxy Authentication Required',
		408 => 'Request Timeout',
		409 => 'Conflict',
		410 => 'Gone',
		411 => 'Length Required',
		412 => 'Precondition Failed',
		413 => 'Request Entity Too Large',
		414 => 'Request-URI Too Long',
		415 => 'Unsupported Media Type',
		416 => 'Requested Range Not Satisfiable',
		417 => 'Expectation Failed',
		422 => 'Unprocessable Entity',
		423 => 'Locked',
		424 => 'Failed Dependency',
		500 => 'Internal Server Error',
		501 => 'Not Implemented',
		502 => 'Bad Gateway',
		503 => 'Service Unavailable',
		504 => 'Gateway Timeout',
		505 => 'HTTP Version Not Supported',
		507 => 'Insufficient Storage',
		509 => 'Bandwidth Limit Exceeded'
	);
	
	public function __construct() {
		$this->headers = array();
		$this->status = 200;
	}

	public function setHttpStatus($status) {

		if(!isset($this->statuses[$status])) {
			throw new Exception('Invalid HTTP Status: ' . $status);
		}

		$this->status = $status;
	}

	public function getHttpStatus() {
		return $this->status;
	}

	/*
	 * 
	*/
	public function redirect($url) {

		header("Location: " . $url, true, 302);
		die();
	}

	public function addHeader($name, $value, $replace = true) {

		if($replace) {
			foreach($this->headers as $index => $header) {
				if($header['name'] == $name) {
					unset($this->headers[$index]);
				}
			}
		}

		$this->headers[] = array(
			'name'	=> $name,
			'value'	=> $value,
			'replace' => $replace,
		);
	}

	public function sendHeaders() {
		$request = Registry::getInstance()->request;
		$protocol = $request->server('SERVER_PROTOCOL', 'HTTP/1.1');

		header($protocol . ' ' . $this->status . ' ' . $this->statuses[$this->status], true, $this->status);
		// protocol status name, replace, status code

		foreach($this->headers as $header) {
			// echo "<pre>" . print_r($header, true) . "</pre>";

			header($header['name'] . ': ' . $header['value'], $header['replace']);
		}
	}
}