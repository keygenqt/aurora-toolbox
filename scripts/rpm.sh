#!/bin/bash

##############################
## Build and create rpm package
##############################

#=============================
check_package()
{
if [ -n "`rpm -q $1`" ]      
then
  echo "Checking $1... OK"
else
  echo ""
  echo "Checking $1... Not found!"
  echo "use: apt-get install $1"
  exit 1
fi
}
#=============================

if [ -z "$1" ]
  then
    echo "usage: ./rpm.sh [version to build]"
    exit 1
fi

NAME='aurora-toolbox'

check_package sudo
check_package meson
check_package wget
check_package rpm-build
check_package libgjs-devel
check_package libgtk4-devel
check_package libadwaita-devel

echo ""
echo "Preparing..."
mkdir -p ~/RPM/SOURCES && mkdir -p ~/RPM/SPECS
cd ~/RPM/SOURCES && wget https://github.com/keygenqt/$NAME/archive/refs/tags/$1.tar.gz
cd ~/RPM/SPECS && wget https://raw.githubusercontent.com/keygenqt/$NAME/refs/tags/$1/rpm/aurora-toolbox.spec

echo ""
echo "Build..."
rpmbuild -bb aurora-toolbox.spec

echo ""
echo "Installing..."
cd ~/RPM/RPMS/`arch`/
sudo rpm -i $NAME-$1*.rpm
