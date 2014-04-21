<?php

class Cache {

	private static $instance;
	private $cache_dir;
	
	public function __construct() {
		$this->cache_dir = Registry::getInstance()->config->cache_dir;
	}

	public static function getInstance() {
		if(self::$instance == null) {
			self::$instance = new Cache();
		}

		return self::$instance;
	}

	public function read($file) {
		return file_get_contents($this->cache_dir . $this->process($file));
	}

	public function write($file, $contents) {
		file_put_contents($this->cache_dir . $this->process($file), $contents);
	}

	public function cached($file) {
		return file_exists($this->cache_dir . $this->process($file));
	}

	public function delete($file) {
		unlink($this->cache_dir . $this->process($file));
	}

	private function process($file) {
		return str_replace('/', '+', $file);
	}
}