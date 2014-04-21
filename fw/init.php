<?php

set_include_path(dirname(__FILE__));
session_start();

require_once 'Loader.php';
require_once 'global/common.php';

Loader::init();

$config = new Config();
$config->loadConfig('config.ini');

$registry = Registry::getInstance();
$registry->config = $config;

ErrorHandler::getInstance();

$registry->db = new Database();
$registry->request = new Request();
$registry->response = new Response();

unset($config, $registry);