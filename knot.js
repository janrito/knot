/**
* @class Knot
* @description A lemma visualisation for single documents.
* @author Alejandro
* @version 0.1
*/

Knot = function () {

	this.options = arguments[0] || {};

	// descriptiors
	this.label = this.options.label || "Knot";
	this.description = this.options.description || "Knot Visualization";
	this.window =  this.window,

	// set containers

	this.canvasEl =  jQuery('#canvas');
	this.canvas = Raphael('canvas', 600, 600);
	this.lemmaForm = jQuery('#lemmaForm');
	this.lemmaEl = jQuery("#lemma", this.lemmaForm);
	
	this.workEl = jQuery('#work');
	this.legendEl = jQuery('#legend');
	
	this.lemma = null;
	
	this.color = null;
	
	this.work = null;
	
	this.paths = this.canvas.group();
	this.pathsStack = [];
	

	//defaults

	//proxy

	this.api = this.options.api || 
	{
		proxy: 'proxy/',
		getWork: '/get/CorpusManager.getWork?id=ncf-22501&format=xml'	
	};

	// xml work list
	this.cachedData = null;

};

Knot.prototype = {
	init : function () {
		var knot = this;

		knot.loadData();
		
		var col = jQuery('#abs_cp');
		
		jQuery('.colorp', col).click( function() {
			jQuery('#colorp', knot.lemmaForm).css('background-color', jQuery(this).css('background-color')).click();
			
		});
		
		jQuery('#colorp', knot.lemmaForm).toggle( function () {
			var offset = jQuery(this).offset();
			col.css(
				{
					'top': offset.top,
					'left': offset.left + 30
				
				}).show();
			}, function () {
				col.hide();
			});
		
		knot.lemmaEl.bind('blur', function () {
			var searchterm = jQuery(this).val();
			
			if (searchterm.length == 0) {
				knot.lemmaEl.val(jQuery('label', knot.lemmaForm).text());
			}
		}).blur();
		
		knot.lemmaEl.bind('focus', function () {
			var searchterm = jQuery(this).val();
			
			if (jQuery('label', knot.lemmaForm).text() == searchterm){
				knot.lemmaEl.val('');
			}
		});
		
		knot.lemmaForm.bind('submit', function (e) {
			e.preventDefault();
			knot.lemma = new RegExp( '\\b' + knot.lemmaEl.val() + '\\b', 'gim');
			knot.currentColor = jQuery('#colorp', knot.lemmaForm).css('background-color');
			knot.draw();
		});
		
		jQuery('#bigger').click( function(e) {
			e.preventDefault();
			knot.paths.scale(1.1, 1.1);
		});
		
		jQuery('#smaller').click( function(e) {
			e.preventDefault();
			knot.paths.scale(.9, .9);
		});
	},
	
	loadData: function () {
		var knot = this;

		jQuery.ajax({
			type: 'GET',
			url: knot.api.proxy + knot.api.getWork,
			beforeSend: function () {
				knot.blockUI(0);
			},
			success: function (response) {
				knot.cachedData = response;
			},
			error: function (response, status, errorThrown) {
				console.log(errorThrown);
				knot.cachedData = response;
			},
			complete: function () {
				knot.work = jQuery('div', knot.cachedData).text();
				
				knot.unblockUI();
			}
		});
	},
	
	blockUI: function() {
		var knot = this;
		var inter = arguments[0] || 100;
		var options = arguments[1] || { message: '<img src="ajax-loader.gif" /> <p> Just a moment...</p>', overlayCSS: {background: '#45443f'}};

		this.blocking = window.setTimeout( function () {
			jQuery.blockUI(options); 
		}, inter);
	},

	unblockUI: function () {
		var knot = this;
		if (this.blocking) {
			clearTimeout(this.blocking);
			this.blocking = false;
		}
		window.setTimeout( function() {
			jQuery.unblockUI();
			}, 100);
	},
	
	draw: function () {
		var knot = this;
		
		var worksize = knot.work.length;
		
		var newPath = this.paths.path(
			{
				stroke: knot.currentColor,
				"stroke-width": "2px", 
				"stroke-linejoin": "round", 
				"stroke-linecap": "round"
				
			}).moveTo(300, 300).relatively();
	
		
		var angle = Math.PI/4;
		var lastmatch = 0;
		
		var drawing = function (x, y) {
			var timer = setTimeout( function() {
				newPath.lineTo(x, y);
			}, 300);
		}
		
		knot.lemma.exec(knot.work);
		
		do {
			
			
			var pathlength = (knot.lemma.lastIndex - lastmatch)/worksize * 1000;
			var coordinates = [Math.cos(angle) * pathlength, Math.sin(angle) * pathlength];
			
		
			drawing.apply(this, coordinates);
			
			
			
			angle = (angle + Math.PI/4) % (2 * Math.PI);
			lastmatch = knot.lemma.lastIndex;
			
		} while (knot.lemma.exec(knot.work))
		
		newPath.toFront();
		
		knot.addKnotControl({
			'path': newPath,
			'query': knot.lemmaEl.val(),
			'lemma': knot.lemma, 
			'color': knot.currentColor
		});
		
		
	},
	
	addKnotControl: function (knotObj) {
		var knot = this;
		knot.pathsStack.push(knotObj);
		jQuery('<div class="knotlegend" style="color:' + knotObj.color + '">' + knotObj.query + '</div>').appendTo(knot.legendEl);
	}


};
