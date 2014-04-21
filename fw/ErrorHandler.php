<?php

/*
 * 
*/
class ErrorHandler {

	private static $debug;
	private static $instance;
	
	/*
	 * 
	*/
	public static function getInstance() {

		if(self::$instance == null) {
			self::$debug = Registry::getInstance()->config->debug;

			register_shutdown_function(array('ErrorHandler', 'fatal_error_handler'));

			if(!self::$debug) {
				error_reporting(E_ERROR);
			}
			else {
				error_reporting(E_ALL);
				set_error_handler(array('ErrorHandler', 'error_handler'));
			}

			self::$instance = new ErrorHandler();

			set_exception_handler(array('ErrorHandler', 'exception_handler'));
		}

		return self::$instance;
	}

	public static function exception_handler($e) {

		$message_format = "Exception: %s thrown at %s on line %s<br />%s";
		$trace_format = '#%s - %s(%s): %s(%s)';
		$stack_trace = array();
		$trace = $e->getTrace();
		$len = count($trace);

		foreach($trace as $key => $val) {
			$stack_trace[] = sprintf(
				$trace_format,
				$len - $key,
				$val['file'],
				$val['line'],
				$val['function'],
				isset($val['args']) ? (is_array($val['args']) ? 'Array' : implode(', ', $val['args'])) : ''
			);
		}

		$message = sprintf(
			$message_format,
			$e->getMessage(),
			$e->getFile(),
			$e->getLine(),
			implode("<br />\n", $stack_trace)
		);

		if(self::$debug) {
			// show errors
			die($message);
		}
		else {
			// mail

			mail(Registry::getInstance()->config->contact_email, 'Error', $message);

			// TODO: Display the error screen.
			die('Sorry, an error has occured.');
		}
	}

	public static function error_handler($error_no, $str, $file, $line) {

		if(!self::$debug) {
			return;
		}

		$trace_format = '#%s - %s(%s): %s(%s)';
		$stack_trace = array();
		$trace = debug_backtrace();
		$len = count($trace);

		foreach($trace as $key => $val) {

			if($key == 0) {
				continue;
			}

			$stack_trace[] = sprintf(
				$trace_format,
				$len - $key,
				$val['file'],
				$val['line'],
				$val['function'],
				isset($val['args']) ? (is_array($val['args']) ? 'Array' : implode(', ', $val['args'])) : ''
			);
		}

		echo "$str at $file on line $line<br />\n" . implode("<br />\n", $stack_trace) . "<br />\n";

		return true;
	}

	public static function fatal_error_handler() {
		
		if($error = error_get_last()) {
			if($error['type'] == E_ERROR) {
				echo "<pre>" . print_r($error, true) . "</pre>";
			}
		}
	}
}
