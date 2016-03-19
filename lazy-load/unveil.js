;(function($) {

  $.fn.unveil = function(threshold) {

    var $w = $(window),
        th = threshold || 0,
        images = this,
        loaded;

    this.one("unveil", function() {
      var source = this.getAttribute("data-src");
      source = source || this.getAttribute("data-src");
      this.removeAttribute("data-src");
      if (source) {
        this.setAttribute("src", source);
      }
    });

    function unveil() {
      var inview = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }

    $w.on("scroll.unveil resize.unveil lookup.unveil", unveil);
    
    unveil();

    return this;
  };

})(window.jQuery);