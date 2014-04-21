<?php

class View_Helper_Javascript {

	// Scripts to process
	private $scripts = array();

	// Scripts to ignore
	private $ignore = array();

	/**
	 *
	*/
	public function register($script) {

		if(substr($script, 0, 7) == 'http://' || substr($script, 0, 8) == 'https://') {
			$this->ignore[$script] = '<script type="text/javascript" src="' . $script . '"></script>';
		}
		else {
			$this->scripts[$script] = $script;
		}

		return $this;
	}

	/**
	 * 
	*/
	public function unregister($script) {

		unset($this->ignore[$script]);
		unset($this->scripts[$script]);

		return $this;
	}

	/*
	 * 
	*/
	public function render() {
		return implode('', $this->ignore) . ($this->scripts ? '<script type="text/javascript" src="js/' . implode(',', $this->scripts) . '"></script>' . "\n" : '');

		// die("<pre>" . print_r($this->scripts, true) . "</pre>");

		/*$data = '';

		foreach($this->scripts as $script) {
			$data .= '<script type="text/javascript" src="js/' . $script . '"></script>' . "\n";
		}

		return implode('', $this->ignore) . $data;*/
	}

	/**
	 * 
	*/
	public function __toString() {
		return $this->render();
	}
}