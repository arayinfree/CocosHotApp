# cocos creator 热更新管理器

## 简介
使用 HotUpdateManager 进行热更新管理.

* 与官方demo一致的功能
* 可动态判断是否有远程更新而无需下载version.manifest文件进行比对
* 可根据后台下发,动态修改远程目录

## DEMO
详见 HelloWorld.js
```
     onLoad: function () {
        this.label.string = this.text;

        this.cell_template.parent = null;

        this.checkBtn.on('click',this.checkBtnPress,this);
        this.udpateBtn.on('click',this.updateBtnPress,this);

        //初始化本地manifest
        HotUpdateManager.init(this.manifestUrl)

        //可通过 jsVersion 获取到当前的版本号
        this.label.string = HotUpdateManager.jsVersion || '1.0.0';
    },

    checkBtnPress(){
        let self = this;
        this.addInfo('click check');

        // let url = 'http://192.168.0.154/hotApp/'
        let url = this.serverUrlEditBox.string;  //可修改的远程目录
        let ver = null;
        if (this.serverVerEditBox.string && this.serverVerEditBox.string != ''){
            ver = this.serverVerEditBox.string  //可修改的快速检查 版本号.
        }
        HotUpdateManager.fastCheck(url,ver,function(type){
            if (type){
                self.addInfo('need update !!!');
            }else{
                self.addInfo('no update !!!');
            }
        })
    },

    updateBtnPress(){
        let self = this;
        this.addInfo('click update');
        HotUpdateManager.hotUpdate(function(ret,canRetry){
            if (ret){
                self.addInfo('udpate success !!!!!');
            }else{
                self.addInfo('update failed !');
                if (canRetry){
                    self.addInfo('canRetry !');
                }else{
                    self.addInfo('can not Retry !');
                }
            }
        },function(progress,str){
            self.addInfo('udpate progress ' + str);
        });
    },

```

## METHOD
HotUpdateManager.js

    /**
     * 初始化
     * @param {*} manifestUrl //请传入 manifestUrl
     */
    init(manifestUrl)
    

     /**
     * 
     * @param {*} remoteUrl 配置后,忽略 配置文件的 packUrl/version/project ,以 remoteUrl 替换 packUrl, 拼接替换 version/project
     * @param {*} remoteVer 设置后, 比较版本时,忽略下载 version.manifest 步骤. 以此字符串与本地版本号进行比较
     * @param {*} checkCallback //回到函数 ,_checkCallback(result); result => HotUpdateManager.CAN_UPDATE , HotUpdateManager.NO_UDPATE
     */
    fastCheck( remoteUrl= null,remoteVer = null,checkCallback)

    /**
     * 开始热更新
     * @param {} callback(success,canretry) //成功时返回值 true , 然后自动重启虚拟机. 可以在此回调 保存状态以便重启虚拟机后恢复页面. 如果返回 false ,可调用 retry 重试更新
     * @param {} progressCallback //进度回调 (progress,str) //进度 0~100. str = progress+'%'
     */
    hotUpdate(callback,progressCallback)

    /**
     * 下载失败时,点击重试
     * @param {} callback //重试回调. 成功时返回值 true , 然后自动重启虚拟机.
     */
    retry(callback)

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