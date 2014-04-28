<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Konodel / Image Editor</title>
	<script type="text/javascript" src="lib/modernizr.js"></script>
	<script type="text/javascript" src="lib/mootools.js"></script>
	<script type="text/javascript" src="assets/js/global.js"></script>
	<script type="text/javascript" src="lib/more.js"></script>
	<script type="text/javascript" src="lib/cerabox.js"></script>
	<script type="text/javascript" src="lib/moorainbow.js"></script>
	<script type="text/javascript" src="lib/uvumicrop.js"></script>
	<script type="text/javascript" src="lib/require.js" data-main="assets/js/init"></script>
	<?= $this->helper('css')
		->register('index.css')
		->register('cerabox.css')
		->register('uvumi-crop.css')
		->register('upload.css')
		->register('moorainbow.css') ?>
</head>
<body>
	<div id="menu">
		<div class="left">
			<ul>
				<li id="brand"><a href="#">Konodel</a></li>
				<li><a href="#">File</a>
					<ul id="file-list">
						<li><a href="#" id="btnNew">New</a></li>
				<?php if($this->user->isLoggedIn()): ?>
					<li><a href="#load-box" id="btnLoad" title="Ctrl-O">Open</a></li>
					<li><a href="#save-box" id="btnSave" title="Ctrl-S">Save</a></li>
				<?php endif ?>
					<li><a href="#upload-box" id="btnUpload" title="Ctrl-M">Upload</a></li>
					</ul>
				</li>
				<li id="btnExport"><a href="#">Export Image</a>
					<ul>
						<li><a id="btnExportJPG">JPG</a></li>
						<li><a id="btnExportPNG">PNG</a></li>
					</ul>
				</li>
				<li id="btnUndo"><a href="#" title="Ctrl-Z">Undo</a></li>
				<li id="btnRedo"><a href="#" title="Ctrl-Y">Redo</a></li>
			</ul>
		</div>
		<div class="right">
			<div class="login-text">
			<?php if($this->user->isLoggedIn()): ?>
			<a href="logout">Logout</a> (<?= $this->user->username ?>)
			<?php else: ?>
			<a href="#login-box" id="btnLogin">Login</a> or <a href="#register-box" id="btnRegister">register</a>
			<?php endif ?>
			</div>
		</div>
	</div>
	<div id="editor-content">
		<div id="tools" class="left">
			<ul>
				<li id="ToolPaint" class="clickable">Paint</li>
				<li id="ToolFill" class="clickable">Fill</li>
				<li id="ToolPicker" class="clickable">Colour Picker</li>
				<li id="ToolEraser" class="clickable">Eraser</li>
				<li id="ToolRotate" class="clickable">Rotate</li>
				<li id="ToolResize" class="clickable">Resize</li>
				<li id="ToolCrop" class="clickable">Crop</li>
				<li id="ToolSelect" class="clickable">Select</li>
				<li id="ToolFilter" class="isParent">Filters
					<ul>
						<li id="FilterGrayscale" class="clickable hasParent">Grayscale</li>
						<li id="FilterBrightness" class="clickable hasParent">Brightness</li>
						<li id="FilterThreshold" class="clickable hasParent">Threshold</li>
						<li id="FilterBlur" class="clickable hasParent">Blur</li>
						<li id="FilterSharpen" class="clickable hasParent">Sharpen</li>
					</ul>
				</li>
			</ul>
		</div>
		<div id="canvas-container" class="left">
			<div id="mouse-pointer">
				<div id="mouse-outline"></div>
			</div>
		</div>
		<noscript>
			<h1>JavaScript is disabled</h1>
			<p>Please enable JavaScript to view this application properly</p>
		</noscript>
		<div id="upgrade-browser">
			<h1>Please upgrade your browser</h1>
			<p>Sorry, you are using an old or outdated browser. To access the features on this web application please upgrade to a newer version.</p>
		</div>
		<div id="tools-info" class="right">
			<div id="map">
				<div id="map-selection"></div>
				<canvas id="map-canvas"></canvas>
			</div>
			<div id="layers-panel">
				<div class="layers-header">Layers</div>
				<div id="layer-scrollbar">
					<ul id="layers-container"></ul>
				</div>
			</div>
			<div id="layers-buttons">
				<a id="layer-new" class="btn">New</a>
				<a class="btn" id="layer-delete">Delete</a>
			</div>
			<div class="layers-header">Layer Opacity</div>
			<div id="layer-opacity" class="slider"><div class="knob"></div></div>
			<div class="layers-header" id="tool-options-name">Tool Options</div>
			<div id="tool-options">
				<div id="tool-options-content"></div>
			</div>
		</div>
	</div>
	<div class="hidden">
		<a id="colour-picker">Click</a>
		<a id="view-link" href="#" target="_blank">View</a>
		<div id="login-box">
			<h3 class="modal-heading">Login</h3>
			<div class="login-container">
				<form method="post" action="<?= $this->helper('config')->site_base_web ?>login">
					<label for="username">Username/Email:</label>
					<input type="text" name="username" id="username" maxlength="40" /><br />
					<label for="password">Password:</label>
					<input type="password" name="password" id="password" maxlength="60" /><br />
					<input type="submit" name="btnLoginSubmit" class="btn" value="Login" />
				</form>
			</div>
		</div>
		<div id="load-box">
			<h3 class="modal-heading">Open Image</h3>
		</div>
		<div id="save-box">
			<h3 class="modal-heading">Save Image</h3>
			<div class="modal-message">Enter a name and description (optional) to save your image</div>
			<div class="save-content">
				<label for="name">Name:</label><br />
				<input type="text" name="name" id="name" class="save-name" maxlength="100" /><br />
				<label for="saveDescription">Description:</label><br />
				<textarea name="description" id="saveDescription" class="save-description"></textarea><br />
				<label for="publishImage">Publish Image:</label><input type="checkbox" id="publishImage" /><!-- <br /> -->
			</div>
			<button class="btnImageSave btn btnLarge right">Save</button>
			<!-- <a class="btnImageSave btn btnLarge right">Save</a> -->
		</div>
		<div id="register-box">
			<h3 class="modal-heading">Create Account</h3>
			<div class="register-container">
				<form method="post" action="<?= $this->helper('config')->site_base_web ?>register">
					<label for="register-username">Username:</label>
					<input type="text" name="username" id="register-username" maxlength="40" /><br />
					<label for="email">Email:</label>
					<input type="text" name="email" id="email" maxlength="50" /><br />
					<label for="register-password">Password:</label>
					<input type="password" name="password" id="register-password" maxlength="60" /><br />
					<input type="submit" name="btnRegisterSubmit" class="btn" value="Register" />
				</form>
			</div>
		</div>
		<div id="upload-box">
			<h3 class="modal-heading">Upload Image</h3>
			<div class="modal-message">Choose an image to upload (jpeg, png, gif)</div>
			<form method="post" enctype="multipart/form-data" action="<?= $this->helper('config')->site_base_web ?>upload">
				<div class="uploadContainer">
					<div class="uploadClick btn">Select File</div>
					<div class="uploadDrop btn">Drag your image here</div>
				</div>
				<div class="uploadLayer">Add to current image: <input type="checkbox" checked="checked" class="chkCurrentImage" /></div>
				<div class="uploadProgress">
					<div class="uploadProgressBar"></div>
				</div>
				<input type="submit" value="Upload" style="display:none" />
				<input type="file" name="file" class="uploadFile" />
			</form>
		</div>
	</div>
</body>
</html>