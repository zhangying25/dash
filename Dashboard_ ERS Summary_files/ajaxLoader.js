define(function(){
 function ajaxLoader (el, options) {
  var defaults = {
    bgColor  : '#fff',
    duration : 800,
    opacity  : 0.5,
    classOveride : false
  }
  this.options = jQuery.extend(defaults, options);

  this.container = $(el);

  this.init = function() {
    // Delete any other loaders
    this.remove(); 
    // Create the overlay 
    var overlay = $('<div></div>').css({
     'background-color': this.options.bgColor,
     'opacity':this.options.opacity,
     'width':this.container.width(),
     'height':this.container.height(),
     'position':'absolute',
     'top':'0px',
     'left':'0px',
     'z-index':99999999
    }).addClass('ajax_overlay');
    // add an overiding class name to set new loader style 
    if (this.options.classOveride) {
      overlay.addClass(this.options.classOveride);
    }
    // insert overlay and loader into DOM 
    this.container.append(
     overlay.append(
      $('<div class="ajax_loader"></div>')
     ).fadeIn(this.options.duration)
    );
  };
	
  this.remove = function(){
    var overlay = this.container.children(".ajax_overlay");
      if (overlay.length) {
        overlay.fadeOut(this.options.classOveride, function() {
         overlay.remove();
      });
    }	
   }

  this.init();
 }

 return ajaxLoader;
});	
