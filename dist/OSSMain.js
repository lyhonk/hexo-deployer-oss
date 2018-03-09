'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('hexo-fs');
var OSS = require('ali-oss');
var co = require('co');
var crypto = require('crypto');
var path = require('path');

function getUploadPath(absPath, root) {
    var pathArr = absPath.split(path.sep);
    var rootIndex = pathArr.indexOf(root);
    pathArr = pathArr.slice(rootIndex + 1);
    return pathArr.join('/');
}

var OSSMain = function OSSMain(config, log, publicDir) {
    (0, _classCallCheck3.default)(this, OSSMain);

    _initialiseProps.call(this);

    this.state.config = config;
    this.state.log = log;
    this.state.publicDir = publicDir;
}

//开始提交操作


//检查配置信息


//获取本地待上传文件


//下载文件


//获取文件MD5
;

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.state = {
        log: null,
        publicDir: null,
        config: null,
        client: null
    };

    this.start = function () {
        if (_this.checkConfig()) {
            _this.state.client = new OSS({
                region: _this.state.config.region,
                accessKeyId: _this.state.config.accessKeyId,
                accessKeySecret: _this.state.config.accessKeySecret,
                bucket: _this.state.config.bucket
            });
            _this.downloadFile('file.md5.map', function (result) {
                var ossMap = {};
                if (result) {
                    ossMap = JSON.parse(result.content.toString());
                }

                var files = _this.localFiels();
                var index = 0;
                var localMD5Map = {};
                files.map(function (file) {
                    _this.getFileMD5(file, function (md5) {
                        localMD5Map[file] = md5;
                        index++;

                        if (!ossMap[file] || ossMap[file] != md5) {
                            _this.uploadFile(file);
                        }

                        if (index >= files.length) {
                            _this.uploadFileContent('file.md5.map', (0, _stringify2.default)(localMD5Map));
                        }
                    });
                });
            });
        }
    };

    this.checkConfig = function () {
        if (!_this.state.config.accessKeyId || !_this.state.config.accessKeySecret || !_this.state.config.bucket || !_this.state.config.region) {
            var message = ['Please check if you have made the following settings', 'deploy:', '  type: oss', '  accessKeyId: yourAccessKeyId', '  accessKeySecret: yourAccessKeySecret', '  bucket: yourBucketName', '  region: yourRegion', ''];
            console.info(message.join('/n'));
            _this.state.log.error('hexo-deployer-oss: config error');
            return false;
        } else {
            return true;
        }
    };

    this.localFiels = function () {
        return fs.listDirSync(_this.state.publicDir);
    };

    this.downloadFile = function (key, callback) {
        var client = _this.state.client;
        co( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return client.get(key);

                        case 2:
                            result = _context.sent;

                            callback(result);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        })).catch(function (err) {
            callback();
        });
    };

    this.getFileMD5 = function (file, callback) {
        var stream = fs.createReadStream(path.join(_this.state.publicDir, file));
        var fsHash = crypto.createHash('md5');
        stream.on('data', function (d) {
            fsHash.update(d);
        });

        stream.on('end', function () {
            var value = fsHash.digest('hex');
            callback(value);
        });
    };

    this.uploadFile = function (file) {
        var client = _this.state.client;
        var log = _this.state.log;
        var dir = _this.state.publicDir;
        co( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return client.put(file, path.join(dir, file));

                        case 2:
                            log.info('upload', file, 'ok');

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        })).catch(function (err) {
            log.error(err);
        });
    };

    this.uploadFileContent = function (key, content) {
        var client = _this.state.client;
        var log = _this.state.log;
        co( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return client.put(key, new Buffer(content));

                        case 2:
                            log.info('upload', key, 'ok');

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        })).catch(function (err) {
            log.error(err);
        });
    };
};

module.exports = function (args) {
    new OSSMain(args, this.log, this.public_dir).start();
};
// var option = new function () {
//
//     const fs = require('hexo-fs')
//     const crypto = require('crypto')
//     const path = require('path')
//     const co = require('co')
//     const OSS = require('ali-oss')
//
//     this.config = null
//     this.log = null
//     this.publicDir = null
//     this.client = null
//
//     this.init = (config,log,publicDir) =>{
//         this.log = log
//         this.publicDir = publicDir
//
//         if (!config.accessKeyId || !config.accessKeySecret || !config.bucket || !config.region) {
//             var message = [
//                 'Please check if you have made the following settings',
//                 'deploy:',
//                 '  type: oss',
//                 '  accessKeyId: yourAccessKeyId',
//                 '  accessKeySecret: yourAccessKeySecret',
//                 '  bucket: yourBucketName',
//                 '  region: yourRegion',
//                 ''
//             ];
//             console.info(message.join('/n'))
//             this.log.error('hexo-deployer-oss: config error')
//             return false
//         }
//
//         this.config = config
//         this.client = new OSS({
//             region: this.config.region,
//             accessKeyId: this.config.accessKeyId,
//             accessKeySecret: this.config.accessKeySecret,
//             bucket: this.config.bucket
//         });
//
//         return true
//     }
//
//     this.start = (config,log,publicDir) =>{
//         if(option.init(config,log,publicDir)){
//             option.downloadMD5MapFile((ossMD5Map) =>{
//                 var files = option.getLocalFile(option.publicDir)
//                 var md5Map = option.createMD5MapFile(files)
//
//                 var uploads = files  //[]
// //                 for (var file in md5Map){
// //                     if(!ossMD5Map[file] || ossMD5Map[file] != md5Map[file]){
// //                         uploads.push(file)
// //                     }
// //                 }
//
// //                 var deletes = []
// //                 for (var file in ossMD5Map){
// //                     if(!files[file]){
// //                         deletes.push(file)
// //                     }
// //                 }
//
// //                 deletes.forEach((file)=>{
// //                     this.deleteFile(file)
// //                 })
//
//                 this.uploadFiles(uploads)
//                 this.uploadFileContent('file.md5.map',JSON.stringify(md5Map))
//
//             })
//         }
//     }
//
//
//     this.getLocalFile = (dir) =>{
//         return fs.listDirSync(dir)
//     }
//
//     this.getMD5 = (value) =>{
//         var md5 = crypto.createHash('md5')
//         md5.update(value)
//         return md5.digest("hex")
//     }
//
//     this.createMD5MapFile = (files) =>{
//         var md5Map = {}
//         files.forEach((file) =>{
//             md5Map[file] = this.getMD5(file)
//         })
//         return md5Map
//     }
//
//     this.downloadMD5MapFile = (callback) =>{
//         var client = this.client
//         co(function* () {
//             var result = yield client.get('file.md5.map');
//             callback(JSON.parse(result.content.toString()))
//         }).catch(function (err) {
//             console.log(err);
//             callback({})
//         });
//     }
//
//     this.uploadFiles = (files) =>{
//         var client = this.client
//         var dir = this.publicDir
//         files.forEach(function (file) {
//             co(function* () {
//                 yield client.put(file, path.join(dir,file))
//                 console.info('upload',file,'ok')
//             }).catch(function (err) {
//                 console.log(err);
//             });
//         })
//     }
//
//     this.uploadFileContent = (key,content) =>{
//         var client = this.client
//         co(function* () {
//             yield client.put(key, new Buffer(content));
//             console.log('upload',key,'ok');
//         }).catch(function (err) {
//             console.log(err);
//         });
//     }
//
//     this.deleteFile = (file)=>{
//         var client = this.client
//         co(function* () {
//             yield client.delete(file);
//             console.log("delete",file,"ok");
//         }).catch(function (err) {
//             console.log(err);
//         });
//     }
//
// }