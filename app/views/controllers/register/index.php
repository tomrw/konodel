<!DOCTYPE html>
<html>
<head>
	<title>Konodel / Register</title>
	<link rel="stylesheet" type="text/css" href="css/account.css">
</head>
<body>
	<div class="centre">
		<div class="container">
			<div class="container-heading">Create Account</div>
			<?php if(isset($this->error)): ?>
			<div class="errors">
				<?= $this->error ?>
			</div>
			<?php endif; ?>
			<form method="post" action="<?= $this->helper('config')->site_base_web ?>register">
				<label for="username">Username:</label><input type="text" name="username" id="username" maxlength="40" value="<?= isset($this->username) ? $this->username : '' ?>" /><br />
				<label for="email">Email:</label><input type="text" name="email" id="email" maxlength="50" value="<?= isset($this->email) ? $this->email : '' ?>" /><br />
				<label for="password">Password:</label><input type="password" name="password" id="password" maxlength="60" value="<?= isset($this->password) ? $this->password : '' ?>" /><br />
				<input type="submit" name="btnRegisterSubmit" value="Register" class="btn" /> <a href="<?= $this->config->site_base_web ?>" class="back btn">Back</a>
			</form>
		</div>
	</div>
</body>
</html>