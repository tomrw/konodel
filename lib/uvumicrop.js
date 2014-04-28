/*
UvumiTools Crop V2.0.1 http://uvumi.com/tools/crop.html

Copyright (c) 2008 Uvumi LLC

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
	
var Cropper = new Class({
	
	Implements : [Events, Options],
	
	options : {
		// maskOpacity:0.5,	//the overlay opacity. Because this property in not easy to directly implement with valid CSS in every browser, we set it with javacript. 0 is transparent, 1 is full opacity. If 0 or false, the mask is not generated at all and not updated (good for slow computers).
		// maskClassName:'cropperMask',	//CSS class name to style the overlay. Only for backgound color, other properties are set with javascript.
		handleClassName:'cropperHandle',	//CSS class name to style handles. Then each handles reacives additional classes 'left', 'right', 'top' or 'bottom' for extra individual styling
		resizerClassName:'cropperResize',	//CSS class name to style the resizer: Mostly for border and cursor.
		wrapperClassName:'cropperWrapper',	//the image is injected a a wrapper. this is a CSS class to eventually add a border
		coordinatesClassName:'cropperCoordinates', // CSSS class of the coordinates box if enabled
		mini:{	//Minimum selection sizes in pixels. Those will also define the ratio if keepRatio is enabled
			x:10,
			y:10
		},
		start:{
			x:100,
			y:100
		},
		handles:[	// drag handles to be added on the resizer's borders. Will create a handle for each array element. Can be a string ('top', 'left', 'bottom', 'rigth'), in which case the handle will be added in the middle of the corresponding segment, or a couple, in which case the handle will be added in the corresponding corner. You can create any combination from one to eight handles. If the array is empty or 'handles' = false, will be considered as not resizable.
			['top','left'],
			'top',
			['top','right'],
			'right',
			'left',
			['bottom','left'],
			'bottom',
			['bottom','right']
		],
		onComplete:$empty,	//function to execute everytime you finish moving/resizing the cropper. The function receive the top, left, height and width of the resizer. You can use this function to put those value in a form and later send them to a server script to process the image.
		onDestroy:$empty,	//fired when the destroy() function is called
		keepRatio:false, //if the aspect ratio, defined by the mini option, should be maintained when resizing. You can set to to false, but still manually maintain ration by holding shift while resizing. In this case it will use the current size as the ratio to keep. But you must tell you users about this feature.
		// doubleClik:true, //if selection should maximize on double click
		handleSize:16, // the size in pixel of the resizing handles.
		onDestroy:$empty //event function executed when the cropper is destroyed (can be usefull to remove some element you might have injected in the toolbox)
	},
	
	initialize : function(target,options){
		//target is the image we want to crop
		this.target = $(target);
		
		//just an idiot check before anything else, if target is not an image, just exits.
		/*if(!this.target.match('img')){
			return false;
		}*/
				
		this.setOptions(options);

		this.params = this.options.parameters;
		//Just creating a SHORTER variable name, because this one comes back often
		this.mini={};
		this.mini.x=this.options.mini.x.toInt();
		this.mini.y=this.options.mini.y.toInt();

		this.width = this.target.getSize().x;

		//Generating the new elements. see the functions for more details
		this.buildCropper();
		
		//initialize the dragging, using the target element as container,
		//On complete we fire the optional event function, providing the top, left, width and height of the selection a parameters.
		//Those coordinates are also stored in the object, so you can access them from an external function,
		//while going against object oriented programming rules which state that object variables are supposed to be private
		this.drag = new Drag.Move(this.resizer,{
			container:this.target,
			snap:0,
			onStart:this.hideHandles.bind(this),
			onComplete:function(){
				this.showHandles();
				this.fireEvent('onComplete',[this.top,this.left,this.width,this.height]);
			}.bind(this)
		});
		
		//We initializse the resizing objects if option resizable is set to true and there are resizing handles
		if(this.options.handles && this.options.handles.length){
			//we create two drag instance for vertical and horizontal for better control.
			//In some case one direction needs to be inverted, but not the other, which is not possible with only one instance
			//the drag are detached bedcause we start them manually
			this.resizeX = new Drag(this.resizer,{
				snap:0,
				modifiers:{
					x:'width',
					y:false
				},
				onComplete:this.stopResize.bind(this)
			}).detach();
			this.resizeY = new Drag(this.resizer,{
				snap:0,
				modifiers:{
					x:false,
					y:'height'
				},
				onComplete:this.stopResize.bind(this)
			}).detach();
			
			/*if(this.options.doubleClik){
				this.resizer.addEvent('dblclick',this.expandToMax.bind(this));
			}*/
			
			//add correct events depending on the ratio option
			if(this.options.keepRatio){
				this.ratioOn();
			}else{
				this.ratioOff();
			}
		}else{
			//if no resizing, we add much simple drag event
			this.drag.addEvent('drag',this.onDrag.bind(this));
		}
		//because preview is only refreshed when the selection is beeing moved/resized, we fire the drag event to generate the initial preview, before the user has done anything.
		this.drag.fireEvent('onDrag');
		this.drag.fireEvent('onComplete');
	},

/*
BUILDING FUNCTIONS
*/
	buildCropper : function(){
		//a wrapper element is created. it adopts the target element
		//using a wrapper is important because every positionning can be done relatively to it.
		//If you resize the window of the the document layout is modified, the mask and selection will stay aligned onto the picture.
		//It wouldn't be the case if we were just working directly in the documen body.
		//You may have to edit the wrapper's CSS to keep the original look of your page after it is injected around the image
		//(if image was floateed, had a margin ore a border, you'll have to set the same properties to the wrapper)
		//That's why we assign it a css class.
		/*this.wrapper = new Element('div',{
			'class':this.options.wrapperClassName,
			styles:{
				position:'relative',
				width : this.target.getSize().x + 10,
				height :this.target.getSize().y,
				overflow:'hidden',
				float:'left'
			}
		}).wraps(this.target);*/
		this.border = this.target.getStyle('border-left');
		//just in case, to avoid bad results because of browser default styling
		/*this.target.setStyles({
			margin:0,
			border:0,
			'float':'none'
		});*/

		//get the target element coordinates, will be used a lot. We suppose the element position doesn't change
		// this.target_coord=this.target.getCoordinates(this.wrapper);
		this.target_coord=this.target.getCoordinates(this.target);
		this.scaleRatio = 1; //this.width/this.target_coord.width;
		
		//We might modify the original mimimum values in the next tests,
		//but wew are still going to need them for the preview, so we make copies
		/*this.previewSize = {
			x:this.mini.x,
			y:this.mini.y
		};*/
		
		//This is just for extrem cases, if you have an image smaller than the minimum required, or a resized image with weird proportions (super tall or super wide)
		if(this.target_coord.width<this.mini.x){
			this.mini.y = this.target_coord.width*this.mini.y/this.mini.x;
			this.mini.x = this.target_coord.width;
		}
		if(this.target_coord.height<this.mini.y){
			this.mini.x = this.target_coord.height*this.mini.x/this.mini.y;
			this.mini.y = this.target_coord.height;
		}

		//the main selection element,  which will be draggable and resizable, generated from the options. It is centered on the target image
		//We assign it a CSS class, because it's important to give it a border, especially if you disable the mask.
		//Also, use  CSS to set a blank GIF background image, otherwise the mousedown event is not fired in IE if the element doesn't have a "solid" background
		//The critical preoperties, like position and dimension are hardcoded by safety.
		this.resizer = new Element('div',{
			'class':this.options.resizerClassName,
			title:'Hold mouse down to move',
			styles:{
				position:'absolute',
				display:'none',
				margin:0,
				opacity:0,
				width:this.options.start.x,
				height:this.options.start.y,
				left:(this.target_coord.left+(this.target_coord.width/2)-(this.options.start.x/2)).toInt(),
				top:(this.target_coord.top+(this.target_coord.height/2)-(this.options.start.y/2)).toInt(),
				zIndex:5
			}
		});
		// }).inject(this.target,'after');

		this.target.adopt(this.resizer);

		//In our case, it is important that the selection has exactly the dimension we want it to have, because we want to use its coordinates
		//So, because the selection element has a margin and a padding(requiered), we must substract thos values everytime we set the selection width or height
		//we set it once in the object, so we doesn't have to calculate it everytime
		this.margin=2*this.resizer.getStyle('border-width').toInt();
		
		this.resizer.setStyles({
			// width:(this.scaleRatio<1?(this.mini.x/this.scaleRatio).toInt():this.mini.x) - this.margin,
			// height:(this.scaleRatio<1?(this.mini.y/this.scaleRatio).toInt():this.mini.y) - this.margin
			width: this.options.start.x - this.margin,
			height: this.options.start.y - this.margin
		});
		
		//create resizing handles
		if(this.options.handles && this.options.handles.length){
			this.options.handles.each(this.buildHandle,this);
		}
		// this.rezr_coord=this.resizer.getCoordinates(this.target);
		this.rezr_coord=this.resizer.getCoordinates();
		// this.rezr_coord=this.resizer.getCoordinates(this.wrapper);
	},
	
	//generic function to build one handle
	buildHandle:function(coord){
		coord=$splat(coord);
		var x = '';
		var y = '';
		['left','right'].each(function(abs){
			if(coord.contains(abs)){
				x=abs;
			}
		});
		['top','bottom'].each(function(ord){
			if(coord.contains(ord)){
				y=ord;
			}
		});
		//creates the handle element
		var handle = new Element('div',{
			'class':this.options.handleClassName+' '+y+' '+x,
			title:(this.options.keepRatio?'Drag to resize':'Hold Shift to maintain aspect ratio'),
			tween:{
				duration:250,
				link:'cancel'
			},
			styles:{
				position:'absolute',
				height:this.options.handleSize,
				width:this.options.handleSize,
				fontSize:0
			},
			events:{
				mousedown:this.startResize.bind(this)
			}
		});
		handle.inject(this.resizer);
		//position it depending on the passed arguments
		if(y == 'top'){
			handle.setStyle('top',-((this.options.handleSize+this.margin)/2).toInt());
		}else if(y == 'bottom'){
			handle.setStyle('bottom',-((this.options.handleSize+this.margin)/2).toInt());
		}else{
			handle.setStyles({
				top:'50%',
				marginTop:-(this.options.handleSize/2).toInt()
			});
		}
		if(x == 'left'){
			handle.setStyle('left',-((this.options.handleSize+this.margin)/2).toInt());
		}else if(x == 'right'){
			handle.setStyle('right',-((this.options.handleSize+this.margin)/2).toInt());
		}else{
			handle.setStyles({
				left:'50%',
				marginLeft:-(this.options.handleSize/2).toInt()
			});
		}
	},

	setSize: function(x, y) {

		var dimensions = this.target.getSize();

		if(x > dimensions.x) x = dimensions.x;
		if(y > dimensions.y) y = dimensions.y;

		this.resizer.setStyles({
			width:x,
			height:y,
			left:(dimensions.x - x) / 2,
			top:(dimensions.y - y) / 2
		});

		this.drag.fireEvent('onDrag');
		this.drag.fireEvent('onComplete');
	},

	autoSize: function() {

		var dimensions = this.target.getSize();
		this.setSize(Math.max(dimensions.x / 4 * 3, this.mini.x), Math.max(dimensions.y / 4 * 3, this.mini.y));
	},

	resize: function() {
		this.target_coord=this.target.getCoordinates(this.target);
		this.rezr_coord=this.resizer.getCoordinates();
		// this.scaleRatio = this.width/this.target_coord.width;
	},
	
	//this function is assigned to each handle mousedown event. It's a big hack that would be to long to explain, but it works. If you don't want to break it,  don't try to fix it.
	startResize:function(e){
		this.resizing = true;
		var handle = $(e.target);
		if(e.shift && !this.options.keepRatio){
			this.ratioOn();
		}
		this.drag.addEvent('beforeStart',function(){
			this.drag.options.limit={
				x:[0,(this.rezr_coord.right-(this.mini.x/this.scaleRatio).toInt())],
				y:[0,(this.rezr_coord.bottom-(this.mini.y/this.scaleRatio).toInt())]
			};
		}.bind(this));
		if(handle.hasClass('left')){
			this.resizeX.options.invert=true;
			this.drag.options.modifiers.x='left';
			this.resizeX.options.limit={x:[
				((this.mini.x/this.scaleRatio).toInt()-this.margin),
				(this.rezr_coord.right-this.margin)
			]};
			this.resizeX.start(e);
		}else if(handle.hasClass('right') || this.ratio){
			this.resizeX.options.invert=false;
			this.drag.options.modifiers.x=false;
			this.resizeX.options.limit={x:[
				((this.mini.x/this.scaleRatio).toInt()-this.margin),
				((this.target_coord.width-this.margin)-this.rezr_coord.left)
			]};
			this.resizeX.start(e);
		}else{
			this.drag.options.modifiers.x=false;
		}
		if(handle.hasClass('top')){
			this.resizeY.options.invert=true;
			this.drag.options.modifiers.y='top';
			this.resizeY.options.limit={y:[
				((this.mini.y/this.scaleRatio).toInt()-this.margin),
				(this.rezr_coord.bottom-this.margin)
			]};
			this.resizeY.start(e);
		}else if(handle.hasClass('bottom') || this.ratio){
			this.resizeY.options.invert=false;
			this.drag.options.modifiers.y=false;
			this.resizeY.options.limit={y:[
				((this.mini.y/this.scaleRatio).toInt()-this.margin),
				((this.target_coord.height-this.margin)-this.rezr_coord.top)
			]};
			this.resizeY.start(e);
		}else{
			this.drag.options.modifiers.y=false;
		}		
	},
	
	//fired when mouseup on handles
	stopResize:function(){
		this.resizing = false;
		this.drag.options.modifiers={x:'left',y:'top'};
		this.drag.options.limit=false;
		this.drag.removeEvents('beforeStart');
		if(this.ratio){
			this.check();
			this.onDrag();
			if(!this.options.keepRatio){
				this.ratioOff();
			}
		}
	},
	
	hideHandles:function(){
		if(!this.resizing){
			$$('.'+this.options.handleClassName).fade('out');
		}
	},
	
	showHandles:function(){
		if(!this.resizing){
			$$('.'+this.options.handleClassName).fade('in');
		}
	},
	
	//fired when moving/resizing the cropper, it updates the mask and the top, left and width value. It also updates the preview
	onDrag:function() {

		// this.updateMask();
		// this.rezr_coord = this.resizer.getCoordinates(this.wrapper);
		this.rezr_coord = this.resizer.getCoordinates(this.target);
		this.top = ((this.rezr_coord.top-this.target_coord.top)*this.scaleRatio).toInt();
		this.left = ((this.rezr_coord.left-this.target_coord.left)*this.scaleRatio).toInt();
		this.width = Math.max((this.rezr_coord.width*this.scaleRatio).toInt(),this.mini.x);
		this.height = Math.max((this.rezr_coord.height*this.scaleRatio).toInt(),this.mini.y);
		// this.updateCoordinates();
		// this.fireEvent('onPreview',[this.top,this.left,this.width,this.height]);
	},
	
	//fired when moving/resizing the cropper with keepRatio enabled
	onDragRatio:function(){
		if(this.resizing){
			this.check();
		}
		this.onDrag();
	},
	
	check:function(){
		// this.rezr_coord=this.resizer.getCoordinates(this.wrapper);
		// this.rezr_coord=this.resizer.getCoordinates(this.target);
		this.rezr_coord=this.resizer.getCoordinates();
		if(this.ratio>1){
			var width = (this.rezr_coord.height*this.ratio).toInt();
			var height = this.rezr_coord.height;
			this.resizer.setStyle('width',Math.min(width,this.target_coord.width-this.rezr_coord.left)-this.margin);
		}else{
			var width = this.rezr_coord.width;
			var height = (this.rezr_coord.width/this.ratio).toInt();
			this.resizer.setStyle('height',Math.min(height,this.target_coord.height-this.rezr_coord.top)-this.margin);
		}
		if(this.drag.options.modifiers.x){
			this.resizer.setStyle('left',Math.max(this.rezr_coord.right-width,0));
		}
		if(this.drag.options.modifiers.y){
			this.resizer.setStyle('top',Math.max(this.rezr_coord.bottom-height,0));
		}
		// this.rezr_coord=this.resizer.getCoordinates(this.wrapper);
		// this.rezr_coord=this.resizer.getCoordinates(this.target);
		this.rezr_coord=this.resizer.getCoordinates();
		if(this.rezr_coord.right>=this.target_coord.width){
			this.resizer.setStyle('height',(this.rezr_coord.width/this.ratio).toInt()-this.margin);
		}
		if(this.rezr_coord.bottom>=this.target_coord.height){
			this.resizer.setStyle('width',(this.rezr_coord.height*this.ratio).toInt()-this.margin);
		}
	},
		
	/*expandToMax:function(){
		if(this.ratio){
			if(this.target_coord.width/this.target_coord.height<this.ratio){
				var top = ((this.target_coord.height-(this.target_coord.width/this.ratio))/2).toInt();
				var left = 0;
				var width = this.target_coord.width-this.margin;
				var height = (this.target_coord.width/this.ratio).toInt()-this.margin;
			}else{
				var top = 0;
				var left = ((this.target_coord.width-(this.target_coord.height*this.ratio))/2).toInt();
				var width = (this.target_coord.height*this.ratio).toInt()-this.margin;
				var height = this.target_coord.height-this.margin;
			}
		}else{
			var top = 0;
			var left = 0;
			var width = this.target_coord.width-this.margin;
			var height = this.target_coord.height-this.margin;
			
		}
		var effect = {
			0:{
				top:top,
				left:left,
				width:width,
				height:height
			},
			1:{
				clip:[[this.rezr_coord.top,this.rezr_coord.right,this.rezr_coord.bottom,this.rezr_coord.left],[top,left+width,height+top,left]]
			}
		};

		slide = new Fx.Elements(this.resizer, {
			onComplete:function() {
				this.drag.fireEvent('onDrag');
				this.drag.fireEvent('onComplete');
			}.bind(this)
		});

		slide.start(effect);
	},*/
	
	//hide the cropper + preview + mask
	hide:function() {
		this.resizer.fade('out');

		setTimeout(function() {
			if(!this.target) return;
			var dimensions = this.target.getSize();

			this.resizer.setStyles({
				left:dimensions.x + 20,
				top:dimensions.y + 20,
				display: 'none'
			});
		},500);
	},
	
	//unhide the cropper
	show:function(){
		this.resizer.setStyle('display', 'block');
		this.resizer.fade('in');

		this.drag.fireEvent('onDrag');
		this.drag.fireEvent('onComplete');
	},
	
	//show/hide the mask
	toggle:function(){
		if(this.resizer.getStyle('opacity')==1) {
			this.hide();
		}else{
			this.show();
		}
	},
	
	//remove the generated elements
	destroy:function(){
		//if you need to remove the cropper when you're done
		this.hide();
		// this.target.setStyle('border',this.border);
		(function(){
			// this.target.replaces(this.wrapper);
			this.fireEvent('onDestroy',this.target);
		}).delay(600,this);
	},
	
	//enable the ratio maintaining. Either called if keepRatio option true, or if shift is pressed when starting to resize
	ratioOn:function(){
		this.ratio = this.rezr_coord.width/this.rezr_coord.height;
		this.drag.removeEvents('drag');
		this.drag.addEvent('drag',this.onDragRatio.bind(this));
	},
	
	//disable ratio. Call on initialisation if keepRatio is false, or after a manually maintainted ratio resizing 
	ratioOff:function(){
		this.ratio = false;
		this.drag.removeEvents('drag');
		this.drag.addEvent('drag',this.onDrag.bind(this));
	}
});