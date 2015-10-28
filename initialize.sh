#!/bin/sh

# install docker
wget -q -O - https://get.docker.io/gpg | apt-key add -;
echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list;
apt-get update -qq;
apt-get install -q -y --force-yes lxc-docker;
# add vagrant user to the docker group
usermod -a -G docker vagrant;

# install docker-compose
curl -L https://github.com/docker/compose/releases/download/1.4.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose;
chmod +x /usr/local/bin/docker-compose;

# build and run compose containers
cd /vagrant;
docker-compose up -d;
