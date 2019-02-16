####################################################
# 配置完毕开关参数及固定参数,然后使用 gitbash 运行 sh build.sh 脚本即可. 
####################################################
####################################################
# 开关参数
####################################################
#debug 用于调试.cocos 生成资源为 debug 版本. 生成apk 依然为 release ! 
debug=false
#是否build Cocos 资源
buildCocos=true
#是否打包热更新? 生成热更新配置文件.并且生成 压缩包 到 packVersion 目录
hotupdate=true
#查看GameConfig.js 进行配置.最好一致 如果版本提升.两个地方都改呀
hotVersion='1.0.0.1'
#是否拷贝当前 cocos/jsb-default/ res,src 到安卓目录
buildAndroid=true
#是否生成apk
buildApk=false

####################################################
#   版本固定参数
####################################################
#cocos creator 路径
CCocosCreator='/c/CocosCreator/CocosCreator.exe'

#项目目录
projectPath='/e/code/HotApp/'

#LinkTo
ASBuildPath='/e/code/HotApp/buildAndroid/jsb-default/'

#查看GameConfig.js 进行配置
hotRemoteUrl='http://192.168.0.186/hotApp/'

#一般在桌面 包名/包名/release/xxx.apk
apkPath='/e/fingerKaeng/apk'
apkName='FingerKaeng'
#生成apk 包参数. 如果想要 debug 请 修改为 XXXDebug ,并自行查找 ${ASProjectPath}/app/build/outputs/apk/$apkName/debug/xxx.apk
apkArgs='assembleFingerKaengRelease'


####################################################
#   下面开始工作代码
####################################################
cd ${projectPath}'androidTool'


sh ASBuildTemplate.sh -c $projectPath -e $CCocosCreator -a $ASBuildPath -d $debug -b $buildCocos -s $buildAndroid -p $hotupdate -h $hotRemoteUrl -v $hotVersion

starttime=$(date +%Y-%m-%d\ %H:%M:%S)


if [ $buildApk = true ] 
then
echo 'build apk'

ASProjectPath="${ASBuildPath}frameworks/runtime-src/proj.android-studio"
cd $ASProjectPath
./gradlew $apkArgs
cd "${projectPath}/androidTool"
#拷贝apk
node copyApk.js -s  ${ASProjectPath}/app/build/outputs/apk/$apkName/release -d $apkPath
echo '完成' 
echo $starttime
cd $apkPath
explorer .
exit 0
fi

echo '完成' 
echo $starttime

