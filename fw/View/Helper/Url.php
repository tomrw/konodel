<?php

class View_Helper_Url {
	
	public function build($params = array(), $action = '', $controller = '') {
		return buildUrl($params, $action, $controller);
	}
}