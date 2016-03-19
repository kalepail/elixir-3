var elixir = function(object) {
  "use strict";


  var $$ = function(element) {
    return document.querySelectorAll(element);
  }


  var initialize = function(object) { // Get started by stopping all downloads and then selectively add them back
    for (var id in object) { // Loop through the elixir command's object
      combine(id, object[id]);
    }
    elixir.object = object || {}; // set a global elixir object so we can use this in the resize function
  }


  var combine = function(id, object, reload) { // The combine function for collecting all the images into a single array
    var reload = reload || false,
        elements = $$(id),
        widths = object["widths"] || [320,640,800,1200,1500,1800,2400,3000],
        heights = object["heights"] || false,
        lazy_tag = object["lazy_tag"] || false,
        lazy_url = object["lazy_url"] || false,
        image_array = [];

    var inspect = function(item) { // Inspect each image and opperate on it accordingly
      if (lazy_url && !reload) {
        item.setAttribute("src", lazy_url);
      }
      image_array.push(item);
    }

    // In the future look at adding the images to an object so we don't sweep all the children
    // ---------------------------------------------------------
    for (var i = 0; i < elements.length; i++) { // look at all the elements and..
      if (elements[i].tagName === "IMG" || elements[i].style.cssText.length) { // ..if a single image push to inspect..
        inspect(elements[i]);
      } else if (elements[i].children.length > 0) { // ..else push all image tags or background images from a collection
        var images;

        if (elements[i].querySelectorAll("[data-elixir]").length > 0) {
          images = elements[i].querySelectorAll("[data-elixir]");
        } else if (elements[i].querySelectorAll("img").length > 0) {
          images = elements[i].querySelectorAll("img");
        } else if (elements[i].querySelectorAll("[style]").length > 0) {
          images = elements[i].querySelectorAll("[style]");
        }

        for (var c = 0; c < images.length; c++) {
          inspect(images[c]);
        }
      }
    }

    swap(image_array, widths, heights, lazy_tag, reload);
  }


  var swap = function(images, widths, heights, lazy_tag, reload) { // Swap function
    for (var i = 0; i < images.length; i++) { // loop through all this collection's images
      var current_element = images[i],
          old_src = current_element.getAttribute("data-elixir") || current_element.getAttribute(lazy_tag) || current_element.src || current_element.style.cssText,
          real_width = current_element.offsetWidth * dpr(),
          new_width,
          new_height,
          new_src,
          tag;

      if (old_src.match(/(w=)\d+/) !== null || old_src.match(/(-w)\d+/) !== null) { // check if image has replaceable values
        var old_width = old_src.match(/(w=)\d+/) !== null ? old_src.match(/(w=)\d+/)[0].replace("w=", "") : old_src.match(/(-w)\d+/)[0].replace("-w", "");
      } else {
        var old_width = null;
      }

      var resrc = function() { // the resrc function called if image has grown or an initial load has fired
        if (lazy_tag) { // lazy load
          if (current_element.getAttribute(lazy_tag) || current_element.getAttribute("data-elixir")) {
            tag = lazy_tag;
          } else {
            tag = "src";
          }
        } else if (current_element.tagName === "IMG") { // If plain
          tag = "src";
        } else { // background image
          tag = "style";
        }

        if (!reload) {
          current_element.removeAttribute("data-elixir");
        }

        for (var j = 0; j < widths.length; j++) { // Find next largest array value
          if (widths[j] >= real_width) {
            new_width = widths[j];
            if (heights) {
              new_height = heights[j];
            }; break;
          } else {
            new_width = widths[j];
            if (heights) {
              new_height = heights[j];
            };
          }   
        }

        if (heights) {
          new_src = old_src // Set the new src by replacing old values with the new ones
            .replace(/(-w)\d+/, "-w" + new_width)   // __
            .replace(/(-h)\d+/, "-h" + new_height)  // ^^ these are for self generated images [-w500 or -h500]
            .replace(/(w=)\d+/, "w=" + new_width)   // __
            .replace(/(h=)\d+/, "h=" + new_height); // ^^ and these are for imgIX  
        } else {
          new_src = old_src
            .replace(/(-w)\d+/, "-w" + new_width)
            .replace(/(w=)\d+/, "w=" + new_width)
        };
        
        current_element.setAttribute(tag, new_src); // Finally set our tag to the new sources
      }

      if (real_width > parseFloat(old_width) || !reload) { // If the image has grown or an inital load, please reload image
        resrc();
      }
    }
  }


  var dpr = function() { // Look for window.devicePixelRatio support
    var pixelRatio = 1; // just for safety
    
    if("deviceXDPI" in screen){ // IE mobile or IE
      pixelRatio = screen.deviceXDPI / screen.logicalXDPI;
    } else if (window.hasOwnProperty("devicePixelRatio")){ // other devices
      pixelRatio = window.devicePixelRatio;
    }
    
    return pixelRatio;
  }


  window.onresize = function() { // When the window resizes, check everything again
    if (this.resize) clearTimeout(this.resize);

    this.resize = setTimeout(function() {
      for (var id in elixir.object) {
        combine(id, elixir.object[id], true);
      }
    }, 500);
  }


  initialize(object);
}