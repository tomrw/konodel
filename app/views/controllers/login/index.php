<!DOCTYPE html>
<html>
<head>
	<title>Konodel / Login</title>
	<link rel="stylesheet" type="text/css" href="css/account.css">
</head>
<body>
	<div class="centre">
		<div class="container">
			<div class="container-heading">Log In</div>
			<?php if(isset($this->login_error)): ?>
			<div class="errors">
				<?= $this->login_error ?>
			</div>
			<?php endif ?>
			<form method="post" action="<?= $this->helper('config')->site_base_web ?>login">
				<label for="username">Username:</label><input type="text" name="username" id="username" maxlength="40" /><br />
				<label for="password">Password:</label><input type="password" name="password" id="password" maxlength="60" /><br />
				<input type="submit" name="btnLoginSubmit" class="btn" value="Login" /> <a href="<?= $this->config->site_base_web ?>" class="back btn">Back</a>
			</form>
		</div>
	</div>
</body>
</html>