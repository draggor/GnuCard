#!/bin/bash
wget http://nodejs.org/dist/node-v0.4.8.tar.gz
tar xvzf http://nodejs.org/dist/node-v0.4.8.tar.gz
cd http://nodejs.org/dist/node-v0.4.8/
./configure
make
sudo make install
curl http://npmjs.org/install.sh | sh
npm install formidable
npm install socket.io
npm install xml2js
