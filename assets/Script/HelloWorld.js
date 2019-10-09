let HotUpdateManager = require('HotUpdateManager')
cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!',

        checkBtn: cc.Node,

        udpateBtn: cc.Node,

        infoList: cc.Node,

        cell_template: cc.Node,

        manifestUrl:{
            url:cc.RawAsset,
            default: null,
        },

        serverUrlEditBox: cc.EditBox,
        serverVerEditBox: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;

        this.cell_template.parent = null;

        this.checkBtn.on('click',this.checkBtnPress,this);
        this.udpateBtn.on('click',this.updateBtnPress,this);
        
        HotUpdateManager.init(this.manifestUrl)

        this.label.string = "origin + " + HotUpdateManager.jsVersion || '1.0.0';
    },

    // called every frame
    update: function (dt) {

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

    addInfo(str){
        let cell = cc.instantiate(this.cell_template);
        cell.getComponent(cc.Label).string = str;
        this.infoList.addChild(cell);
    }
});
