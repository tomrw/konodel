<?php

function buildUrl($params = array(), $action = '', $controller = '') {
	$registry = Registry::getInstance();

	if(!$controller) {
		$controller = $registry->request->get('controller');
	}

	$url = $registry->config->site_base_web . $registry->config->admin_base . $controller;

	if($action) {
		$url .= '/' . $action;
	}

	if($params) {
		$url .= '?' . http_build_query($params);
	}

	return $url;
}
