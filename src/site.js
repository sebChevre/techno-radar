require('./stylesheets/base.scss');
require('./images/favicon.ico');
require('./images/radar_legend.png');

const ExcelSheetInput = require('./util/factory');

var path = require('path');
global.appRoot = document.location.pathname;

console.log("Root webapp path: " + global.appRoot);

//console.log(global.appRoot);
ExcelSheetInput().build();