#!/bin/bash

#################
## Build packages
#################

read -p "What kind of package build? (deb/rpm)? " choice
case "$choice" in
  deb ) echo "Let's start assembling...";;
  rpm ) echo "Let's start assembling...";;
  * ) echo "Required [deb/rpm]"; exit;;
esac

NAME='aurora-toolbox'
PACKAGE='com.keygenqt.aurora-toolbox'
REVISION='1'
FOLDER='release'
DIR="$(dirname "$(realpath "$0")")"
VERSION=$(grep -m 1 version $DIR/../meson.build | xargs | sed 's/[,]//g' | sed 's/version: //g')

# Build deb
if [ "$choice" = "deb" ]; then
  sh $DIR/deb/build.sh $NAME $PACKAGE $REVISION $FOLDER $VERSION
fi

# Build rpm
if [ "$choice" = "rpm" ]; then
  sh $DIR/rpm/build.sh $NAME $PACKAGE $REVISION $FOLDER $VERSION
fi

# DEB Install / Remove
# sudo dpkg -r com.keygenqt.aurora-toolbox
# sudo dpkg -i $DIR/release/deb/*_amd64.deb

# RPM Install / Remove
# sudo rpm -e aurora-toolbox
# sudo rpm -i $DIR/release/rpm/*_amd64.rpm
