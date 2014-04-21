<?php

/*
 * 
*/
class Registry {

	private static $objects;
	private static $registry;

	public static function getInstance() {

		if(self::$registry == null) {
			self::$registry = new Registry();
		}

		return self::$registry;
	}

	/*
	 * 
	*/
	public function isRegistered($key) {
		return isset(self::$registry[$key]);
	}

	/*
	 * 
	*/
	public function __set($key, $value) {
		self::$objects[$key] = $value;
	}

	/*
	 * 
	*/
	public function __get($key) {

		if(!isset(self::$objects[$key])) {
			return null;
		}

		return self::$objects[$key];
	}
}
