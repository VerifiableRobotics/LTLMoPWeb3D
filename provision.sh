#!/bin/sh

echo 'Installing Docker...';
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 \
  --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > \
  /etc/apt/sources.list.d/docker.list;
apt-get update -qq;
apt-get install -qqy docker-engine;
# add vagrant user to the docker group
usermod -aG docker vagrant;

echo 'Installing Docker-Compose...';
curl -sSL https://github.com/docker/compose/releases/download/1.6.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose;
chmod +x /usr/local/bin/docker-compose;

# build and run compose containers
cd /vagrant;
docker-compose up -d;
