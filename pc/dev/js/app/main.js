define(function(require) {
    var basics = require('core/basics');
    
    basics.ui.pagination = require('core/pagination');
    basics.ui.validator    = require('core/validator');
    basics.ui.drag         = require('core/drag');
	basics.ui.dialog       = require('core/dialog');
    basics.ui.pop          = require('core/pop');
    basics.ui.selectArea          = require('core/selectArea');
    require('jquery');
    require('app/jquery.suggestion');
    require('app/common');
    return basics;
});