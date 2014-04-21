<?php

class Controller_Index extends Controller {
	
	public function indexAction() {
		$this->user->username = $this->escapeName($this->user->username);
	}

	private function escapeName($name) {
		$name = str_replace('<', '&lt;', $name);
		$name = str_replace('>', '&gt;', $name);
		$name = str_replace('&', '&amp;', $name);

		return $name;
	}
}