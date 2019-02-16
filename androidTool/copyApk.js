/**
 * 1. 进入到 apk 目录
 * 2. 解析 json,获取 apk
 * 3. 拷贝到目标目录
 * 
 */

 // Parse arguments

var child_process = require('child_process');
var fs = require("fs");
var path = require("path")
var src = null;
var dest = null;
var from=''
var to = ''

var i = 2;
while ( i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
    case '--src' :
    case '-s' :
        src = process.argv[i+1];
        i += 2;
        break;
    case '--dest' :
    case '-d' :
        dest = process.argv[i+1];
        i += 2;
        break;
    default :
        i++;
        break;
    }
}

console.log('src='+src+'')
console.log('dest='+dest+'')
if (!src || !dest){
    console.log('error param. plase use node copyApk.js -s source -d dest'); 
    return;
}

var file = path.join(src,'output.json');
var data = fs.readFileSync(file,'utf-8');
var json=JSON.parse(data);
var apkName = json[0].path
var to = path.join(dest,apkName);
var from = path.join(src,apkName) ;

console.log('copy file from:' + from);
console.log('copy file to  :' + to);
child_process.spawnSync('cp',[from,to]);
child_process.spawnSync('cp',[file,dest]);