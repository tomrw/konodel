<!DOCTYPE html>
<html>
<head>
	<title>Konodel / View</title>
	<link rel="stylesheet" type="text/css" href="../css/view.css">
</head>
<body>
	<div class="centre">
		<div class="container">
		<?php if(isset($this->name)): ?>
			<div class="container-heading"><?= $this->name ?></div>

			<div class="container-img">
				<?php if($this->display): ?>
				<img src="<?= $this->config->site_base_web . $this->display ?>" />
				<?php endif; ?>
			</div>

			<div class="container-text"><?= nl2br($this->description )?></div>
		<?php else: ?>
			<div class="error">This image does not exist</div>
		<?php endif; ?>
	</div>
	</div>
</body>
</html>