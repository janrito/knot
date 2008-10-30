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
	
	this.canvas.circle(300,300,20).attr({'fill': '#666666', 'stroke': '#666666'});
	this.paths = this.canvas.group().toFront();
	this.paths.circle(300, 300,20).attr({'fill': '#666666', 'stroke': '#666666', 'opacity': 0.5});
	
	//form
	
	this.lemmaForm = jQuery('#lemmaForm');
	this.lemmaEl = jQuery("#lemma", this.lemmaForm);
	this.lemma = null;
	this.color = null;
	
	//help
	this.workEl = jQuery('#work');
	this.legendEl = jQuery('#legend');

	//proxy

	this.api = this.options.api || 
	{
		proxy: 'proxy/',
		getWork: '/get/CorpusManager.getWork?id=ncf-22501&format=xml'	
	};

	// xml work list
	this.cachedData = null;
	this.work = null;

};

Knot.prototype = {
	init : function () {
		var knot = this;
		
		knot.loadData();
		
		//color choosing
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
			
		// search box
		
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
		
		// search submit
		knot.lemmaForm.bind('submit', function (e) {
			e.preventDefault();
			knot.lemma = new RegExp( '\\b' + knot.lemmaEl.val() + '\\b', 'gim');
			knot.currentColor = jQuery('#colorp', knot.lemmaForm).css('background-color');
			knot.draw();
		});
		
		// zoom
		jQuery('#bigger').click( function(e) {
			e.preventDefault();
			knot.paths.scale(1.1, 1.1);
		});
		
		jQuery('#smaller').click( function(e) {
			e.preventDefault();
			knot.paths.scale(.9, .9);
		});
		
		// move around
		
		knot.canvasEl.bind('mousedown', function (clickEvent) {
			var prevpos = {pageX: clickEvent.pageX, pageY: clickEvent.pageY};
			knot.canvasEl.bind('mousemove', function (moveEvent) {
				knot.travel(moveEvent.pageX - prevpos.pageX, moveEvent.pageY - prevpos.pageY);
				prevpos = {pageX: moveEvent.pageX, pageY: moveEvent.pageY};
			});
			knot.canvasEl.bind('mouseup', function () {
				knot.canvasEl.unbind('mousemove');
			});
		});
	},
	
	travel: function (deltaX, deltaY) {
		var knot = this;
		knot.paths.translate(deltaX, deltaY);
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
	
		
		var angle = 0;
		var lastmatch = 0;
		
		var drawing = function (x, y) {
			var timer = setTimeout( function() {
				newPath.lineTo(x, y);
			}, 300);
		}
		
		var found = 0;
		
		do {
			
			knot.lemma.exec(knot.work);
			found = knot.lemma.lastIndex || knot.work.length;
			
			var pathlength = (found - lastmatch)/worksize * 2000;
			var coordinates = [Math.cos(angle) * pathlength, Math.sin(angle) * pathlength];
			
		
			drawing.apply(this, coordinates);
			
			
			angle = (angle + Math.PI/4) % (2 * Math.PI);
			
			lastmatch = found;
			
		} while (found != knot.work.length)
		
		newPath.toFront();
		
		knot.addKnotControl({
			'path': newPath,
			'query': knot.lemmaEl.val(),
			'lemma': knot.lemma, 
			'color': knot.currentColor
		});
		
		
	},
	
	addKnotControl: function (knotObj) {
		var knot = this;;
		var legend = jQuery('<div class="knotlegend" style="color:' + knotObj.color + '">' + knotObj.query + '</div>').appendTo(knot.legendEl);
		
		legend.click(function () {
			jQuery(knotObj.path[0]).remove();
			legend.remove();
		});
	}


};
