#!请在当前目录运行
#! ASBuildTemplate.sh 中,打热更新包时,会自动备份当前删减到包中.
current=`PWD`
projectPath=current
destPath=''
while getopts "p:d:" arg #选项后面的冒号表示该选项需要参数
do
        case $arg in
             p)
                echo "projectPath :$OPTARG" 
                projectPath=$OPTARG
                ;;
             d)
                echo "destFile :$OPTARG" 
                destPath=$OPTARG
                ;;
             ?)  #当有不认识的选项的时候arg为?
            echo "unkonw argument"
            exit 1
            ;;
        esac
done
cd  $projectPath'assets'
svn st | grep '^!' | sed 's/!       //g' | sed 's/\\/\//g' > $destPath