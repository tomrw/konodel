<?php

class Loader {

	private static $inited;
	private static $include_paths;
	
	public static function init() {

		if(!self::$inited) {
			self::$include_paths = explode(PATH_SEPARATOR, get_include_path());

			if(!self::$inited = spl_autoload_register('Loader::loadClass')) {
				throw new Exeption('Autoloader failed to start');
			}
		}
	}

	private static function loadClass($className) {

		$className = str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';

		foreach(self::$include_paths as $path) {

			$classPath = $path . DIRECTORY_SEPARATOR . $className;

			if(is_file($classPath) && is_readable($classPath)) {
				require_once $classPath;
				break;
			}
		}
	}
}