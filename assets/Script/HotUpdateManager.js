
// var Handler = require("Handler");
// var GameConfigInfoManager = require("GameConfigInfoManager");
/**
 * 热更新流程
 * 1. init(manifestUrl)
 * 2. fastCheck
 * 3. hotUpdate
 * 4. retry
 *     * 
 */

const KEY_PACKAGE_URL     =    "packageUrl"
const KEY_MANIFEST_URL   =    "remoteManifestUrl"
const KEY_VERSION_URL      =   "remoteVersionUrl"
const KEY_VERSION_STRING      =   "version"

const k_STORE_LAST_VERSION = 'k_STORE_LAST_VERSION' 
var HttpClient = require('HttpClient');
const DOWN_LOAD_FOLDER = 'blackjack-remote-asset';
let HotUpdateManager =  cc.Class({
    statics:{
        instance:null,
        NO_UPDATE : 0,
        CAN_UPDATE : 1,
    },

    properties: {
        manifestUrl:{
            url:cc.RawAsset,
            default: null,
        },

        _updating: false,
        _canRetry: false,
        _storagePath: "",
        _checkListener: null,
        _am: null,

        _fileProgress: 0,
        _byteProgress: 0,

        _needUpdata: false,

        _isLoadServerManifestBln: false,
        _loadServerManifestPor: 0,

        _remoteURL: null, //配置后 .将从 _remoteURL 进行version,project,以及具体文件进行拉取.忽略 project 文件配置的路径
        _remoteVersion:null,
        _localVersion:null,

        jsVersion:{
            get(){
                return this._localVersion;
            }
        }
    },

    log(str){
        console.log(str);
    },

    /**
     * 初始化
     * @param {*} manifestUrl //请传入 manifestUrl
     */
    init(manifestUrl){
        this.manifestUrl = manifestUrl
        if (this._hasInit){
            return;
        }
        this._init();
        this._hasInit = true
    },

    /**
     * 
     * @param {*} remoteUrl 配置后,忽略 配置文件的 packUrl/version/project ,以 remoteUrl 替换 packUrl, 拼接替换 version/project
     * @param {*} remoteVer 设置后, 比较版本时,忽略下载 version.manifest 步骤. 以此字符串与本地版本号进行比较
     * @param {*} checkCallback //回到函数 ,_checkCallback(result); result => HotUpdateManager.CAN_UPDATE , HotUpdateManager.NO_UDPATE
     */
    fastCheck( remoteUrl= null,remoteVer,checkCallback){
        
        this._remoteVersion = remoteVer;
        this._checkCallback = checkCallback;
        if (remoteUrl){
            this._remoteURL = remoteUrl;
            this._gameProjectPath = remoteUrl + "project.manifest";
            this._gameVerPath = remoteUrl + "version.manifest";
        }else{
            this._loadLocalManifest();//设置 _gameVerPath ,_gameProjectPath
        }

        if (remoteVer){
           this.log('fast check remote version' + remoteVer )
           this._doCheckVersion();
        }else{
            //没有传 remoteVer , 拉远程 remoteVer 进行判断.
            // console.log('no fast version')
            this.compareServerVer(); //使用自定义
        }
    },

    /**
     * 开始热更新
     * @param {} callback(success,canretry) //成功时返回值 true , 然后自动重启虚拟机. 可以在此回调 保存状态以便重启虚拟机后恢复页面. 如果返回 false ,可调用 retry 重试更新
     * @param {} progressCallback //进度回调 (progress,str) //进度 0~100. str = progress+'%'
     */
    hotUpdate(callback,progressCallback){
        let self = this;
        self._upateResultCallback = callback;
        self._progressCallback = progressCallback
        if(self._am && !self._updating){
            this.log("[热更新] >> 开始更新 >> hotUpdate");
            HttpClient.GET(self._gameProjectPath,null,function(err,params){
                if (!err){
                    self.loadServerManifestComplete(params);
                }else{
                    self.updateFinish(false);
                    self._isLoadServerManifestBln = false;
                }
            });
            self._isLoadServerManifestBln = true;
            self._loadServerManifestPor = 0;
        }
    },

     /**
     * 下载失败时,点击重试
     * @param {} callback //重试回调. 成功时返回值 true , 然后自动重启虚拟机.
     */
    retry(callback){
        if (callback){
            this._upateResultCallback = callback;
        }
        if (!this._updating && this._canRetry) {
            this._canRetry = false;
            this.log('[热更新] Retry failed Assets...');
            this._am.downloadFailedAssets();
        }else{
            this.log('no retry')
        }
    },
























    updataUIPro(pro){
        let self = this;
        if(pro == null){
            pro = 0;//进度
        }
        let str = "";
        let proValue = Math.floor(pro * 100);
        if(isNaN(proValue)){
            proValue = 0;
        }
        if(proValue.toString() == null || proValue.toString() == NaN){
            str = "0 %";
        }else{
            str = proValue.toString() + " %";
        }
        console.log(str)
        
        if (self._progressCallback){
            try {
                self._progressCallback(proValue,str);
            } catch (error) {
                self.log(error);
            }
        }
    },


    _doCheckVersion(){
        let ret = this.versionCompareHandle(this._localVersion,this._remoteVersion);
        if (ret<0){
            this.checkFinish(true);
        }else{
            this.checkFinish(false);
        }
    },

    checkFinish(canUpdate = false){
        if (this._checkCallback){
            if (canUpdate){
                this._checkCallback(HotUpdateManager.CAN_UPDATE);
            }else{
                this._checkCallback(HotUpdateManager.NO_UPDATE);
            }
        }
    },

    updateCb: function (event) {
        let needRestart = false;
        let failed = false;
        switch (event.getEventCode()){
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.log('[热更新] No local manifest file found, hot update skipped.');
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let byteProgress = event.getPercent();
                this.updataUIPro(byteProgress);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.log('[热更新] Fail to download manifest file, hot update skipped.');
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.log('[热更新] Already up to date with the latest remote version.');
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.log('[热更新] Update finished. ' + event.getMessage());
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.log('[热更新] Update failed. ' + event.getMessage());
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.log('[热更新] Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.log(event.getMessage());
                break;
            default:
                break;
        }

        if(failed){
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
            this.updateFinish(failed);
        }

        if(needRestart){
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            this.log(JSON.stringify(newPaths));
            Array.prototype.unshift(searchPaths, newPaths);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.sys.localStorage.setItem(k_STORE_LAST_VERSION,this._remoteVersion);

            this.updateFinish(true);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },

    //updateFinish
    updateFinish(success = false){
        let self = this;
        if (self._upateResultCallback){
            self._upateResultCallback(success,self._canRetry);
        }
    },

    loadServerManifestComplete(params){
        let self = this;
        self._isLoadServerManifestBln = false;
        self._loadServerManifestPor = 0;
        self.updataUIPro(0);

        if(self._am.getState() === jsb.AssetsManager.State.UNINITED){
            self._am.loadLocalManifest(self.manifestUrl);
        }

        this.log('download server =>' + params);
        let serverManifestStr = params
        if (self._remoteURL){
            let serverManifestObj = JSON.parse(params);
            serverManifestObj[KEY_PACKAGE_URL] = self._remoteURL;
            let tempVersion = serverManifestObj[KEY_VERSION_STRING];
            serverManifestObj[KEY_VERSION_STRING] = self._remoteVersion;
            self._remoteVersion = tempVersion;
            serverManifestStr = JSON.stringify(serverManifestObj);
        }

        this.log('after changed server =>' + serverManifestStr);

        let manifest = new jsb.Manifest(serverManifestStr, self._storagePath);
        self._am.loadRemoteManifest(manifest);
        if (self._am.getState() === jsb.AssetsManager.State.UP_TO_DATE){
            self.updateFinish(false)
            return;
        }
        self._updateListener = new jsb.EventListenerAssetsManager(self._am, self.updateCb.bind(self));
        cc.eventManager.addListener(this._updateListener, 1);

        self._failCount = 0;
        self._am.update();
        self._updating = true;
    },

    versionCompareHandle(versionA, versionB){
        HotUpdateManager.instance.log("[热更新] JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for(let i = 0; i < vA.length; ++i){
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || 0);
            if(a === b) {
                continue;
            }else{
                return a - b;
            }
        }
        if(vB.length > vA.length){
            return -1;
        }else{
            return 0;
        }
    },
    
    _init(){
        let self = this;
        if(!cc.sys.isNative || cc.sys.isBrowser){
            return;
        }
        self._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + DOWN_LOAD_FOLDER);
        this.log('[热更新] Storage path for remote asset : ' + self._storagePath);

        self._am = new jsb.AssetsManager('', self._storagePath, self.versionCompareHandle);
        if(!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            self._am.retain();
        }

        self._am.setVerifyCallback(function (path, asset) {
            let compressed = asset.compressed;
            let expectedMD5 = asset.md5;
            let relativePath = asset.path;
            let size = asset.size;
            if(compressed){
                self.log("[热更新] Verification passed : " + relativePath);
                return true;
            }else{
                self.log("[热更新] Verification passed : " + relativePath + ' (' + expectedMD5 + ')');
                return true;
            }
        });

        self.log('[热更新] game update is ready, please check or directly update.');

        if(cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }
        self._fileProgress = 0;
        self._byteProgress = 0;

        // 初始化 version
        let _localVersion = cc.sys.localStorage.getItem(k_STORE_LAST_VERSION);
        if (_localVersion){
            this._localVersion = _localVersion;
        }else{
            this._loadLocalManifest();            
        }
        
    },

    _loadLocalManifest(){
        if (cc.isBrowser){
            return;
        }
        if(this._am.getState() === jsb.AssetsManager.State.UNINITED){
            // Resolve md5 url
            let url = this.manifestUrl.nativeUrl;
            if(cc.loader.md5Pipe){
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this._am.loadLocalManifest(this.manifestUrl);
        }

        if(!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.log('[热更新] Failed to load local manifest ...');
            this.checkFinish();
            return; 
        }
        let _localVersion = this._am.getLocalManifest().getVersion();
        if (_localVersion != this._localVersion){
            cc.sys.localStorage.setItem(k_STORE_LAST_VERSION,_localVersion);
        }
        if (!this._gameVerPath){
            this._gameVerPath = this._am.getLocalManifest().getVersionFileUrl()
            this._gameProjectPath = this._am.getLocalManifest().getManifestFileUrl()
        }
        this._localVersion = _localVersion;
    },

    loadServerVerManifest(){
        let self = this;
        self.log('load server version ' + self._gameVerPath )
        // _gameVerPath
        HttpClient.GET(self._gameVerPath,null,function(err,params){
            if (!err){
                self.log("[热更新] > 加载版本文件完成 > loadServerVerManifest > " + params);
                let manifest = new jsb.Manifest(params, self._storagePath);
                self._remoteVersion = manifest.getVersion();
                self._doCheckVersion();
                self._updating = false;
            }else{
                self.log("load server version failed")
                self.checkFinish();
                self._updating = false;
            }
        });
    },

    compareServerVer(){
        if(this._updating){
            this.log('[热更新] Checking or updating ...');
            return;
        }

        if(this._am.getState() === jsb.AssetsManager.State.UNINITED){
            // Resolve md5 url
            let url = this.manifestUrl.nativeUrl;
            if(cc.loader.md5Pipe){
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this._am.loadLocalManifest(this.manifestUrl);
        }

        if(!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.log('[热更新] Failed to load local manifest ...');
            this.checkFinish();
            return; 
        }

        this.log('loadServerVerManifest')
        this._updating = true;

        this.loadServerVerManifest();
    },

    update (dt) {
        let self = this;
        if(self._isLoadServerManifestBln){
            self._loadServerManifestPor += 0.001;
            if(self._loadServerManifestPor > 1){
                self._loadServerManifestPor = 1;
            }
            self.updataUIPro(self._loadServerManifestPor);
        }
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});

HotUpdateManager.instance = new HotUpdateManager();
module.exports = HotUpdateManager.instance;
