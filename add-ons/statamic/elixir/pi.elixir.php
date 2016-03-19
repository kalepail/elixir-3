<?php
class Plugin_elixir extends Plugin {
	var $meta = array(
	  'name'        => 'Elixir for Statamic',
	  'description' => 'Image generator for the {{ transform }} tag',
	  'version'     => '3.2',
	  'docs'				=> 'http://tinyanvil.com/elixir/docs',
	  'author'      => '@tyvdh (Tyler van der Hoeven)',
	  'author_url'  => 'http://tylervdh.com'
	);


	public function index()
	{ 
		// Grab all our widths
		$widths = array(320,640,800,1200,1500,1800,2400,2880);

		if ($this->fetchParam('widths')) {
			$widths = explode(',', $this->fetchParam('widths'));
		}


		// If user has defined heights
		$heights = false;

		if ($this->fetchParam('heights')) {
			$heights = explode(',', $this->fetchParam('heights'));
		}


		// Create all of the images
		for ($i = 0; $i < count($widths); $i++) {
			$values = array('width'=>$widths[$i]);

			if ($heights) {
				$values = array('width'=>$widths[$i], 'height'=>$heights[$i]);
			}
			Parse::contextualTemplate($this->content, $values, $this->context);
		}


		// if user has defined this block as a background block
		$background = false;

		if ($this->fetchParam('background', null, null, true)) {
			$background = true;	
		}


		// if user has defined a fallback
		$index = 1;
		$fallback = $this->fetchParam('fallback', null, null, true);
		$fallbackArr = array('width'=>$widths[$index - 1]);

		if ($fallback) {
			$index = $this->fetchParam('fallback');
		}
		if ($heights) {
			$fallbackArr = array('width'=>$widths[$index - 1], 'height'=>$heights[$index - 1]);
		}


		// Are we allowed to use the cache?
		$content = $this->content;

		if ($fallback && $this->session->get('js') == false && !$this->blink->get("fired")) {
			$content .= $this->test_for_js();
			$this->blink->set('fired', true);
		}


		// Time to output some images, first let's look for Js support
		$js = true;

		if ($this->session->get('js') == false) {
			$js = false;
		}

		// Return the default fallback images
		if ($js || !$fallback) {
			return Parse::contextualTemplate($content, $fallbackArr, $this->context);
		} else {
			if ($background) {
				return Parse::contextualTemplate(str_replace('data-elixir', 'style', $content), $fallbackArr, $this->context);
			} else {
				return Parse::contextualTemplate(str_replace('data-elixir', 'src', $content), $fallbackArr, $this->context);	
			}
		}
	}


	private function test_for_js()
	{
 		// Kaboom of Javascript checks.. if you're there.. I will find you
		if (isset($_POST['jstest'])) {
 			$this->session->set('js', true);
 			return null;
 		} else {
 			$js = 
 			'<form name="jsform" id="jsform" method="post" style="display:none">
 	  	  <input name="jstest" type="text" value="true" />
 	  	  <script language="javascript">
 	    	  document.jsform.submit(function() {
 	    	  	window.location.reload();
 	    	  });
 	  	  </script>
 		  </form>';
 		  $this->session->set('js', false);
      return $js;
 		}	
	}
}