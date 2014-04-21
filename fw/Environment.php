<?php

interface Environment {
	function getConfig();
	function getDb();
	function getRequest();
}