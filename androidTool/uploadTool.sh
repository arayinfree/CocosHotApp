
#服务器地址
host='192.168.0.154'
remoteFolder='hotApp'

uploadFile=/e/code/HotApp/packVersion/latest.tar.gz
toFile='pack.tar.gz'
echo $uploadFile
#删除服务器目录
ssh root@$host "cd /usr/share/nginx/html/ && rm -rf $remoteFolder && mkdir $remoteFolder"

echo '上传'

scp $uploadFile  root@$host:/usr/share/nginx/html/$remoteFolder/$toFile

echo '解压'

ssh root@$host "cd /usr/share/nginx/html/$remoteFolder/ && sudo tar -xzf /usr/share/nginx/html/$remoteFolder/$toFile"

starttime=$(date +%Y-%m-%d\ %H:%M:%S)
echo '完成' 
echo $starttime

echo "http://192.168.0.154/$remoteFolder"
#ssh root@192.168.0.154:/usr/share/nginx/html/aray/