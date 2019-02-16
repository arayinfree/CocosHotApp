# cocos creator 热更新管理器

使用 HotUpdateManager 进行热更新管理.

* 与官方demo一致的功能
* 可动态判断是否有远程更新而无需下载version.manifest文件进行比对
* 可根据后台下发,动态修改远程目录


## MORE
打包后需要在 main.js 开头增加如方法设置 搜索路径

```
(function () {
    if (cc && cc.sys.isNative) { 
        var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths'); 
        if (hotUpdateSearchPaths) { 
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths)); 
            console.log('[main.js] 热更新SearchPath: ' + JSON.parse(hotUpdateSearchPaths));
        }else {
            console.log('[main.js] 未获取到热更新资源路径!');
        }
    }else {
        console.log('[main.js] 不是native平台!');
    }
    ...

```