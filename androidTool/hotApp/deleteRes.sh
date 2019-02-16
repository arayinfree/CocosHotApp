filename=`PWD`'/delInfo.txt'
echo $filename
ccAssectPath='/e/belloC13/belloC13/assets/'

cat $filename | while read line
do
echo 'will remove ->'$line
rm -rf $ccAssectPath$line
done
echo 'end '