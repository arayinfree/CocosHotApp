### Android 打包步骤
* svn up 更新代码
* git-bash 进入到 androidTool 对应 目录. 这里以 c13 为例  进入到  androidTool/c13
* 运行  sh deleteRes.sh 删除多余资源. 注意 svn 可能会提示 被删除资源是否加入到 ignore 列表 或标记为 delete . 请点击取消 ! (这样下次可以直接 svn up 恢复被删资源)
* 参考 cocos/androidTool/buildConfigTemplate 进行配置
    * 开关参数 (控制下面提到的`是否`选项)
    * 固定参数 (每个包固定参数都不一样)

* 运行 sh build.sh 构建 cocos 代码 . 构建完毕资源会自动拷贝到对应的android工程

* build 工作流程如下`开关互相独立`
    * `是否` 构建 cocos 工程
    * `是否` 生成热更新配置
        * 根据cocos/build/jsb-default res,src 生成热更新配置文件 到 cocos/packVersion/remote-assets
        * 拷贝热更新配置文件到 cocos 源代码
        * 拷贝热更新配置文件替换 cocos/build/jsb-default/res
        * 生成delInfo.txt 备份 cocos/assets 目录删除文件信息到 remote-assets 
        * 生成 packVersion_dateTime.tar.gz 到packVersion
    * `是否` 拷贝cocos/build/jsb-default res,src,sdkbox_config.json 到 android 目录下
    * `是否` 生成起签名apk.(如果没有拷贝资源到android目录,此时生成的依然是旧资源apk包)完成后打开目录




### Android 手动打包流程
* 初始化配置
* 确定cocos目录 GameInit.js 配置游戏类型
* 确定 GameConfig.js 对应游戏类型配置
* 删除无用资源以压缩包大小 `(可使用deleteRes.sh脚本,然后再额外删除资源)`
* 使用 cocos creator 构建 游戏资源 `(build.sh)`
* 生成热更新配置文件以及 热更新压缩包,并备份被删除资源`(build.sh)`
* 使用 cocos creator 构建 游戏资源`(build.sh)`
* 拷贝游戏资源(res,src)到Android 目录 替换`(build.sh)`
* 打包`(build.sh)`
* 加固(加固完毕记得重新签名)
* 测试上线

### cocos 初始化配置
* clone cocos 工程, 此处称为 Cocos目录
* 构建原生工程到 一个cocos 工程同级目录(或其他目录) 作为 android 工程,此处称为 Android目录
* 使用sdk box 导入 facebook 插件 到原生工程
* 使用 android studio 配置 Android目录 原生环境(参照其他 android 工程进行配置. ) 
* 再次构建原生工程 到 Cocos目录/build 目录下. 作为打包 cocos 资源的副本工程.
*  使用sdk box 导入 facebook 插件到副本工程.并把  build/jsb-default/res/sdkbox_config.json 拷贝到 build/jsb-default 下
* 在 Cocos目录/androidTool/ 参考BuildConfigTemplate工程新建 一个 xx 包目录进行存放脚本(以便自动化打包操作)


## 其他

### 开发环境
* 下载安装 git ,安装过程中注意安装 gitbash .
* 脚本使用 git-bash 运行
* 下载安装 npm  (运行 version_generator.js 需要)

### 删除cocos未使用资源 
删除资源后,运行,测试无误后.可以进行备份删除资源. 下次可以使用脚本进行删除
* 删除资源后,请不要从 svn 移除 或 加入 ignore 列表. 下次 可以直接更新 svn 代码(! 标记资源会再次checkout 下来). 重新运行删除资源脚本即可

删除资源后备份删除内容
* 进入到 Cocos目录/assets/ , 运行 ` svn st | grep '!' > xxx.txt ` 
然后注意修改 xxx.txt 换行为 unix 换行符. 并且 替换 所有 '!  ' => '' , '\' => '/' 

### Android 工程
配置 release 签名
配置 versionCode 自增
build.gradle 输出包命名修改
```
    variant.outputs.all {
        def date = new Date().format("yyyyMMddHHmmss" , TimeZone.getTimeZone("GMT+08"))
        if(variant.buildType.name.equals('debug')){
            outputFileName = "${variant.name}_v${versionCode}_${versionName}_${date}.apk"
        }
        if(variant.buildType.name.equals('release')){
            outputFileName = "${variant.name}_v${versionCode}_${versionName}_${date}.apk"
        }
    }

```

TODO
* 乐固自动加固并签名 . 需要一个有对外IP的服务器以供乐固下载 apk 进行加固. 加固完毕需要使用命令行工具进行签名

