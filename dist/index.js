'use strict';

var _OSSMain = require('./OSSMain');

var _OSSMain2 = _interopRequireDefault(_OSSMain);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

hexo.extend.deployer.register('oss', _OSSMain2.default);