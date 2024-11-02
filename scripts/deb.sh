#!/bin/bash

##############################
## Build and creae deb package
##############################

read -p "You change '@todo debug' code? (y/n)? " choice
case "$choice" in
  y|Y ) echo "yes";;
  n|N ) exit 0;;
  * ) echo "invalid";;
esac


NAME='aurora-toolbox'
PACKAGE='com.keygenqt.aurora-toolbox'
REVISION='1'
FOLDER='release'
ARCH='amd64'

VERSION=$(grep -m 1 version meson.build | xargs | sed 's/[,]//g' | sed 's/version: //g')
DEB_FOLDER="${NAME}_${VERSION}-${REVISION}_${ARCH}"

rm -rf $FOLDER
rm -rf $DEB_FOLDER

meson setup \
    -Dbindir=/usr/local/bin \
    -Ddatadir=/usr/local/share/$PACKAGE \
    -Dlibdir=/usr/local/lib \
    -Dprefix=/usr/local \
    --buildtype=release \
    $FOLDER

ninja -C $FOLDER

mkdir -p $DEB_FOLDER
mkdir -p $DEB_FOLDER/DEBIAN
mkdir -p $DEB_FOLDER/usr/local
mkdir -p $DEB_FOLDER/usr/local/bin
mkdir -p $DEB_FOLDER/usr/local/share/$PACKAGE
mkdir -p $DEB_FOLDER/usr/local/share/locale/ru/LC_MESSAGES
mkdir -p $DEB_FOLDER/usr/share/glib-2.0/schemas
mkdir -p $DEB_FOLDER/usr/share/applications
mkdir -p $DEB_FOLDER/usr/share/icons

chmod +x $FOLDER/src/$PACKAGE

# Bin
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
cp ./files/package/*.desktop $DEB_FOLDER/usr/share/applications
cp ./files/package/*.svg $DEB_FOLDER/usr/share/icons

rm -rf $FOLDER/{*,.[^.]*}

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
mv $DEB_FOLDER.deb $FOLDER
rm -rf $DEB_FOLDER

dpkg -x $FOLDER/$DEB_FOLDER.deb $FOLDER/$DEB_FOLDER

# Install / Remove
sudo dpkg -r com.keygenqt.aurora-toolbox
sudo dpkg -i release/aurora-toolbox_0.0.9-1_amd64.deb
