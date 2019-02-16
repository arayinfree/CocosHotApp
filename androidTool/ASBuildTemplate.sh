#cocos creator 路径
CCocosCreator=/c/CocosCreator/CocosCreator.exe

#项目目录
projectPath='/e/client/forRelease/'

#LinkTo
ASBuildPath='/e/client/HiloAndroid/jsb-default/'

ASProjectPath='/e/client/HiloAndroid/jsb-default/frameworks/runtime-src/proj.android-studio/'

#debug
debug=false

#是否build
needPack=true

#是否更新android res
packAndroidRes=true

#是否打包热更新(默认false)
hotupdate=false
hotVersion=''
hotRemoteUrl=''
#是否


# c cocos Project Path
# e creator.exe Path
# a androidBuildPath
# d build cocos debug ?
# b build cocos res 
# p hotupdate ? 
# h hot update remote url remoteUrl eg 'http://clientios.sumpoker.com/'
# v hot version
# s copy res ,src from build/jsb-default to Android

while getopts "c:e:a:d:b:s:p:h:v:k:t:" arg #选项后面的冒号表示该选项需要参数
do
        case $arg in
             c)
                echo "projectPath :$OPTARG" 
                projectPath=$OPTARG
                ;;
             e)
                echo "creator :$OPTARG" 
                CCocosCreator=$OPTARG
                ;;
             a)
                echo "ASBuildPath :$OPTARG" 
                ASBuildPath=$OPTARG
                ASProjectPath="${OPTARG}frameworks/runtime-src/proj.android-studio/"
                ;;
             d)
                echo "build debug :$OPTARG" 
                debug=$OPTARG
                ;;
             s)
                echo "copy android res :$OPTARG" 
                packAndroidRes=$OPTARG
                ;;
             b)
                echo "build cocos :$OPTARG" 
                needPack=$OPTARG
                ;;
             p)
                echo "hot update :$OPTARG" 
                hotupdate=$OPTARG
                ;;
             h)
                echo "hot update remote :$OPTARG" 
                hotRemoteUrl=$OPTARG
                ;;
             v)
                echo "hot update version :$OPTARG" 
                hotVersion=$OPTARG
                ;;
             ?)  #当有不认识的选项的时候arg为?
            echo "unkonw argument"
            exit 1
            ;;
        esac
done

buildPath='build'

buildParam="platform=android;template=default;androidStudio=true;md5Cache=false;apiLevel=15;debug=$debug;buildPath=$buildPath" 

if [ $needPack = true ] 
then
echo '打包'
$CCocosCreator --path $projectPath --build $buildParam
fi


if [ $hotupdate = true ] 
then
echo '开始热更新'

packVersionPath=$projectPath'packVersion'
packRemotePath=$projectPath'packVersion/remote-assets'

if [ ! -d $packVersionPath ];then
echo "创建 packVersion 目录"
mkdir $packVersionPath
else
echo "已存在 packVersion 目录"
fi


echo '删除remote-assets目录'
rm -rf $packRemotePath

echo '创建remote-assets目录'
mkdir $packRemotePath

echo '生成project ,version 到热更新目录'
node $projectPath/androidTool/version_generator.js -u $hotRemoteUrl  -v $hotVersion -s $projectPath$buildPath/jsb-default -d $packRemotePath


echo '覆盖build,运行时保持版本最新'
cp $packRemotePath/version.manifest $projectPath$buildPath/jsb-default/res/raw-assets
cp $packRemotePath/project.manifest $projectPath$buildPath/jsb-default/res/raw-assets


echo '拷贝 res 到热更新目录'
cp -r $projectPath$buildPath/jsb-default/res $packRemotePath/res

echo '拷贝 src 到热更新目录'
cp -r $projectPath$buildPath/jsb-default/src $packRemotePath/src

echo '覆盖asset/project.manifest,下次打原生包保持版本最新'
cp -r $packRemotePath/project.manifest $projectPath/assets/

echo '覆盖asset/version.manifest,下次打原生包保持版本最新'
cp $packRemotePath/version.manifest $projectPath/assets/

hotTime=$(date +%Y-%m-%d-%H-%M-%S)

# sh $projectPath'androidTool/backupDelRes.sh' -p $projectPath -d $packRemotePath/delInfo.txt

tar zcf $packVersionPath/${hotVersion}_$hotTime.tar.gz -C $packRemotePath .
cp $packVersionPath/${hotVersion}_$hotTime.tar.gz $packVersionPath/latest.tar.gz
fi

if [ $packAndroidRes = true ] 
then
echo '清空AS res,src 目录'
rm -rf $ASBuildPath/res
rm -rf $ASBuildPath/src

echo '拷贝 res,src 到 AS 工程'
cp -r $projectPath$buildPath/jsb-default/res $ASBuildPath/res
cp -r $projectPath$buildPath/jsb-default/src $ASBuildPath/src

echo '拷贝 sdkbox_config.json'
cp -r $projectPath$buildPath/jsb-default/sdkbox_config.json $ASBuildPath/res/sdkbox_config.json

fi


starttime=$(date +%Y-%m-%d\ %H:%M:%S)

echo 'finish Build' 