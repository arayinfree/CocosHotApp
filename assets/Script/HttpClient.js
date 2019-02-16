class HttpClient {
    constructor(){
        this.loading = false;
        this.url = null;
        this.callback = null;
        this.timeOutWait = 10;
    }
    log(str){
        console.log(str);
    }

    dispose(){
        this.loading = false;
        this.url = null;
        this.callback = null;
        if (this._xhr){
            this._xhr.onreadystatechange = null;
            this._xhr.onerror = null;
            this._xhr.onprogress = null;
        }
        this.content = null;
        this.param = null;
        this.clearTimeoutHandler();
    }

    setHeader(key,value){
        if (!this.header){
            this.header = {};
        }
        this.header[key] = value;
    }

    _genUrl(){
        let url = this.url;

        let paramStr = ''
        if (this.param){
            for(var key in this.param){
                if (paramStr!= ''){
                    paramStr+='&'
                }
                paramStr += key+'='+this.param[key];
            }
        }
        let contactStr = "&v=";
        if(url.indexOf("?") > -1){
            if (paramStr != ''){
                contactStr = '&' + paramStr +"&v="
            }else{
                contactStr = "&v="
            }
        }else if (paramStr != ''){
            contactStr = "?" + paramStr + "&v="; 
        }else{
            contactStr = "?v="; 
        }
        url = url + contactStr + new Date().getTime().toString();
        return url
    }

    send(){
        let self = this;
        self._xhr = new XMLHttpRequest();
        
        let url = this._genUrl();
        self._xhr.open(this.method, url, true);

        if(this.header){
            // if(Provisional){
            //     self._xhr.setRequestHeader("Authorization", "Bearer " + token);
            // }else{
            //     self._xhr.setRequestHeader('content-type', 'application/json');
            // }
            for(var key in this.header){
                self._xhr.setRequestHeader(key, this.header[key]);
            }
            
        }

        self._xhr.onreadystatechange = self.onReadyStateChangeHandler.bind(self);
        self._xhr.onerror = self.onErrorHandler.bind(self);
        self._xhr.onprogress = self.onPostProgressHandler.bind(self);

        this.clearTimeoutHandler();
        this._timeOutHandler = setTimeout(() => {
            self.ontimeOutHandler();
        }, this.timeOutWait*1000);
        this.log("[网络请求http] url > " + url);
        try {
            switch (this.method) { 
                case "GET":
                    self._xhr.send();
                    break;
                case "POST":
                    self._xhr.send(this.content);
                    break;
                default:
                    break;
            }
        } catch (error) {
            self.onErrorHandler(error);
        }    
    }

    onPostComplete(err = null,response = null){
       this.clearTimeoutHandler();
        if (this.callback){
            this.callback(err,response);
        }
    }

    clearTimeoutHandler(){
        if(this._timeOutHandler != null){
            clearTimeout(this._timeOutHandler)
            this._timeOutHandler = null;
        }
    }

    onErrorHandler(event) {
        let self = this;
        this.onPostComplete(event,null);
        self.log("[error: 网络连接异常 catch -> 处理函数 -> onErrorHandler 出错]");
    }

    onPostProgressHandler(event) {
        this.log('pregress > ' + (100 * event.loaded / event.total));
    }

    onReadyStateChangeHandler() {
        let self = this;
        try 
        {
            if (self._xhr != null && self._xhr.readyState == 4 && (self._xhr.status >= 200 && self._xhr.status < 400)) {
                let response = self._xhr.responseText;
                self.onPostComplete(null,response);
            }
        } catch (error) {
            self.log("[error: 网络连接异常 catch -> 处理函数 -> onReadyStateChangeHandler 出错]");
            cc.log(error + error.stack);
            self.onPostComplete(error,null);
        }
    }

    ontimeOutHandler(){
        this.log('time out !!!');
    }
} 

HttpClient.GET = function(url,param,callback){
    let req = new HttpClient();
    req.dispose();
    req.url = url;
    req.param = param;
    req.callback = callback;
    req.method = "GET";
    req.send();
}

HttpClient.POST= function(url,content,callback){
    let req = new HttpClient();
    req.dispose();
    req.url = url;
    req.callback = callback;
    req.content = content;
    req.method = "POST";
    req.send();
}

module.exports = HttpClient;