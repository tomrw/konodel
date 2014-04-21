<?php

/*
 * 
*/
class Mail {

	private $to;
	private $from;
	
	public function __construct() {
		$this->to = array();
	}

	public function addTo($to) {
		$this->to[] = $to;
	}

	public function setFrom() {
		$this->from = $from;
	}

	public function send() {
		
	}
}