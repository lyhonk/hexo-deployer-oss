module.exports = function (args) {
    option.start(args,this.log,this.public_dir)
}

var option = new function () {

    const fs = require('hexo-fs')
    const crypto = require('crypto')
    const path = require('path')
    const co = require('co')
    const OSS = require('ali-oss')

    this.config = null
    this.log = null
    this.publicDir = null
    this.client = null

    this.init = (config,log,publicDir) =>{
        this.log = log
        this.publicDir = publicDir

        if (!config.accessKeyId || !config.accessKeySecret || !config.bucket || !config.region) {
            var message = [
                'Please check if you have made the following settings',
                'deploy:',
                '  type: oss',
                '  accessKeyId: yourAccessKeyId',
                '  accessKeySecret: yourAccessKeySecret',
                '  bucket: yourBucketName',
                '  region: yourRegion',
                ''
            ];
            console.info(message.join('/n'))
            this.log.error('hexo-deployer-oss: config error')
            return false
        }

        this.config = config
        this.client = new OSS({
            region: this.config.region,
            accessKeyId: this.config.accessKeyId,
            accessKeySecret: this.config.accessKeySecret,
            bucket: this.config.bucket
        });

        return true
    }

    this.start = (config,log,publicDir) =>{
        if(option.init(config,log,publicDir)){
            option.downloadMD5MapFile((ossMD5Map) =>{
                var files = option.getLocalFile(option.publicDir)
                var md5Map = option.createMD5MapFile(files)

                var uploads = []
                for (var file in md5Map){
                    if(!ossMD5Map[file] || ossMD5Map[file] != md5Map[file]){
                        uploads.push(file)
                    }
                }

                var deletes = []
                for (var file in ossMD5Map){
                    if(!md5Map[file]){
                        deletes.push(file)
                    }
                }

                deletes.forEach((file)=>{
                    this.deleteFile(file)
                })

                this.uploadFiles(uploads)
                this.uploadFileContent('file.md5.map',JSON.stringify(md5Map))

            })
        }
    }


    this.getLocalFile = (dir) =>{
        return fs.listDirSync(dir)
    }

    this.getMD5 = (value) =>{
        var md5 = crypto.createHash('md5')
        md5.update(value)
        return md5.digest("hex")
    }

    this.createMD5MapFile = (files) =>{
        var md5Map = {}
        files.forEach((file) =>{
            md5Map[file] = this.getMD5(file)
        })
        return md5Map
    }

    this.downloadMD5MapFile = (callback) =>{
        var client = this.client
        co(function* () {
            var result = yield client.get('file.md5.map');
            callback(JSON.parse(result.content.toString()))
        }).catch(function (err) {
            console.log(err);
            callback({})
        });
    }

    this.uploadFiles = (files) =>{
        var client = this.client
        var dir = this.publicDir
        files.forEach(function (file) {
            co(function* () {
                yield client.put(file, path.join(dir,file))
                console.info('upload',file,'ok')
            }).catch(function (err) {
                console.log(err);
            });
        })
    }

    this.uploadFileContent = (key,content) =>{
        var client = this.client
        co(function* () {
            yield client.put(key, new Buffer(content));
            console.log('upload',key,'ok');
        }).catch(function (err) {
            console.log(err);
        });
    }

    this.deleteFile = (file)=>{
        var client = this.client
        co(function* () {
            yield client.delete(file);
            console.log("delete",file,"ok");
        }).catch(function (err) {
            console.log(err);
        });
    }

}