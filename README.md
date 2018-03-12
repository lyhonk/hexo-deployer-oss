# hexo-deployer-oss
Hexo plugin of aliyun oss

在博客根目录中安装插件
```
npm install git+https://github.com/guyi-maple/hexo-deployer-oss.git --save
```

_config.yml 配置
```
deploy:
  type: oss
  accessKeyId: <your accessKeyId>
  accessKeySecret: <your accessKeySecret>
  bucket: <your bucket>
  region: <your region>
```
