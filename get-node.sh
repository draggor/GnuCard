#!/bin/bash
ver=${1-"Go to http://nodejs.org and get the latest version.  Usage: get-node 0.4.8"}
if [ "$ver" == "Go to http://nodejs.org and get the latest version.  Usage: get-node 0.4.8" ]
then
echo $ver
else
wget http://nodejs.org/dist/node-v$ver.tar.gz
tar xvzf node-v$ver.tar.gz
cd node-v$ver
./configure
make
sudo make install
fi
