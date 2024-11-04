#!/bin/bash

##############################
## Build and creae deb package
##############################

NAME="$1"
PACKAGE="$2"
REVISION="$3"
FOLDER="$4"
VERSION="$5"

ARCH="amd64"

# Set root dir
DIR="$(dirname "$(realpath "$0")")"
cd $DIR/../../

# Folder for deb
DEB_FOLDER="${NAME}_${VERSION}-${REVISION}_${ARCH}"

# Clear
rm -rf $FOLDER
rm -rf $DEB_FOLDER

# Build
meson setup \
    -Dbindir=/usr/local/bin \
    -Ddatadir=/usr/local/share/$PACKAGE \
    -Dlibdir=/usr/local/lib \
    -Dprefix=/usr/local \
    --buildtype=release \
    $FOLDER

ninja -C $FOLDER

# Create folders
mkdir -p $DEB_FOLDER
mkdir -p $DEB_FOLDER/DEBIAN
mkdir -p $DEB_FOLDER/usr/local
mkdir -p $DEB_FOLDER/usr/local/bin
mkdir -p $DEB_FOLDER/usr/local/share/$PACKAGE
mkdir -p $DEB_FOLDER/usr/local/share/locale/ru/LC_MESSAGES
mkdir -p $DEB_FOLDER/usr/share/glib-2.0/schemas
mkdir -p $DEB_FOLDER/usr/share/applications
mkdir -p $DEB_FOLDER/usr/share/icons

# Bin
chmod +x $FOLDER/src/$PACKAGE
cp $FOLDER/src/$PACKAGE $DEB_FOLDER/usr/local/bin

# Short name
ln -s /usr/local/bin/$PACKAGE $DEB_FOLDER/usr/local/bin/$NAME

# Source
cp $FOLDER/src/*.gresource $DEB_FOLDER/usr/local/share/$PACKAGE
cp $FOLDER/data/*.gresource $DEB_FOLDER/usr/local/share/$PACKAGE

# Translate
cp $FOLDER/po/ru/LC_MESSAGES/*.mo $DEB_FOLDER/usr/local/share/locale/ru/LC_MESSAGES

# Schemas
cp ./data/com.keygenqt.aurora-toolbox.gschema.xml $DEB_FOLDER/usr/share/glib-2.0/schemas

# Menu
cp ./build/data/*.desktop $DEB_FOLDER/usr/share/applications
cp ./build/data/*.svg $DEB_FOLDER/usr/share/icons

# Create control
tee -a $DEB_FOLDER/DEBIAN/control > /dev/null <<EOT
Package: $PACKAGE
Version: $VERSION
Architecture: $ARCH
Maintainer: Vitaliy Zarubin <keygenqt@gmail.com>
Description: An application that provides an easy start in the Aurora OS ecosystem.
Build-Depends: gettext, meson, pkg-config, libgjs-dev, libgtk-4-dev, libadwaita-1-dev
Depends: gjs, language-pack-gnome-ru, language-pack-ru-base, libadwaita-1-0 (>= 1.5)
EOT

dpkg-deb --build --root-owner-group $DEB_FOLDER

# Move
rm -rf ./build/$FOLDER/deb
mkdir -p ./build/$FOLDER/deb
mv $DEB_FOLDER.deb ./build/$FOLDER/deb
rm -rf $FOLDER
rm -rf $DEB_FOLDER
