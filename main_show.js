require.config({
  paths:{
    'jquery' : 'lib/jqueryPlugin/jquery-1.9.1.min',
    'jquery_ui' : 'lib/jqueryPlugin/jquery-ui',
        'jquery_sizes' : 'lib/jqueryPlugin/jquery.sizes',
        'jlayout_border' : 'lib/jqueryPlugin/jlayout.border',
        'jlayout_flexgrid' : 'lib/jqueryPlugin/jlayout.flexgrid',
        'jlayout_flow' : 'lib/jqueryPlugin/jlayout.flow',
        'jlayout_grid' : 'lib/jqueryPlugin/jlayout.grid',
        'jquery_colorize' : 'lib/jqueryPlugin/jquery.colorize-1.7.0',
        'jquery_jlayout' : 'lib/jqueryPlugin/jquery.jlayout',
        'jquery_color' : 'lib/jqueryPlugin/jquery.color',
        'jquery_easing' : 'lib/jqueryPlugin/jquery.easing',
        'jquery_knob' : 'lib/jqueryPlugin/jquery.knob',
        'jquery_dim' : 'lib/jqueryPlugin/jquery.dim.shin',
        'jquery_lightbox' : 'lib/jqueryPlugin/jquery.lightbox_me',
        'jquery_editable' : 'lib/jqueryPlugin/jquery.editable.shin',
        'jquery_scrollbar' : 'lib/jqueryPlugin/jquery.mCustomScrollbar.concat.min',
        'jquery_sidr' : 'lib/jqueryPlugin/jquery.sidr.min',
        'jquery_jmenu' : 'lib/jqueryPlugin/jMenu',

        'jquery_nested_accordion' : 'lib/jqueryPlugin/jquery.nestedAccordion',
        'jquery_icheck' : 'lib/jqueryPlugin/jquery.icheck.min',
        'jquery_farbtastic' : 'lib/jqueryPlugin/jquery.farbtastic',
        'jquery_selectbox' : 'lib/jqueryPlugin/jquery.selectbox-0.2.min',
        'jquery_sidelayer' : 'lib/jqueryPlugin/jquery.side.layer',
        'jquery_sortable' : 'lib/jqueryPlugin/jquery-sortable',
        'jquery_colorpicker' : 'lib/jqueryPlugin/colorpicker',
        'snapshot' : 'lib/html2canvas',

      'underscore' : 'lib/underscore-min',
      'backbone': 'lib/backbone-min',
      'session' : 'lib/session',
      'google_client' : 'lib/google_client',
      'text' : 'lib/text',
      'templates': 'template',

      //camera
      'angle3': 'lib/camera/util/angle3',
      'quaternion': 'lib/camera/util/quaternion',
      'vector3': 'lib/camera/util/vector3',

      'asyncRenderer': 'lib/camera/asyncRenderer',
      'Camera': 'lib/camera/Camera',
      'ObjectController': 'lib/camera/ObjectController',
      'EditGround': 'lib/camera/EditGround',
      'eventRepeater': 'lib/camera/eventRepeater',
      'groundListener': 'lib/camera/groundListener',
      'RenderFPS': 'lib/camera/RenderFPS',
      'CameraModule': 'lib/camera/CameraModule'
  },


  shim : {
      'session' : ['google_client','jquery'],
      'jquery_ui' : ['jquery'],
      'jquery_jlayout' : ['jquery'],
      'jquery_color' : ['jquery'],
      'jqueryKnob' : ['jquery'],
      'jquery_dim' : ['jquery'],
      'jquery_editable' : ['jquery'],
      'jquery_lightbox' : ['jquery'],
      'jquery_sidelayer' : ['jquery'],
      'jquery_sortable' : ['jquery'],
      'jquery_jmenu' : ['jquery_ui'],
      'jlayout_flexgrid' : ['jquery_ui'],
      'jlayout_border' : ['jquery_ui'],
      'jlayout_flow' : ['jquery_ui'],
      'jlayout_grid' : ['jquery_ui'],
      'jquery_colorize' : ['jquery_ui'],
      'jquery_sizes' : ['jquery_ui'],
      'jquery_nested_accordion' : ['jquery_ui'],
      'jquery_icheck' : ['jquery_ui'],
      'jquery_farbtastic' : ['jquery_ui'],
      'jquery_selectbox' : ['jquery_ui'],
      'jquery_jlayout' : ['jlayout_flexgrid','jlayout_border','jlayout_flow','jlayout_grid','jquery_sizes','jquery_colorize']
  }
});

require(['show'],function(App){
    App.initialize();
});