<?php

require_once 'fw/init.php';

$controller = isset($_GET['controller']) ? $_GET['controller'] : 'index';

$renderer = new Renderer();
echo $renderer->render($controller);