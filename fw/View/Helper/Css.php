<?php

class View_Helper_Css {

	private $styles = array();

	/**
	 * 
	*/
	public function register($style) {
		$this->styles[$style] = $style;
		return $this;
	}

	/**
	 * 
	*/
	public function unregister($style) {
		unset($this->styles[$style]);
		return $this;
	}

	/**
	 * 
	*/
	public function __toString() {
		return '<link rel="stylesheet" type="text/css" href="css/' . implode(',', $this->styles) . '">' . "\n";
	}
}