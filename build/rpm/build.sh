#!/bin/bash

###############################
## Build and create rpm package
###############################

NAME="$1"
PACKAGE="$2"
REVISION="$3"
FOLDER="$4"
VERSION="$5"

ARCH="x86_64"

# Set root dir
DIR="$(dirname "$(realpath "$0")")"
cd $DIR/../../

NAME_RPM="$NAME-$VERSION-$REVISION.$ARCH.rpm"
RPM_FOLDER=$HOME/RPM

# Clear
rm -rf $RPM_FOLDER

# Create folders
mkdir -p $RPM_FOLDER
mkdir -p $RPM_FOLDER/SPECS
mkdir -p $RPM_FOLDER/SOURCES

# Copy data
cd $DIR/../../../
cp -R ./$NAME ./$NAME-$VERSION
tar czf source.tar.gz ./$NAME-$VERSION
mv source.tar.gz $RPM_FOLDER/SOURCES
rm -rf ./$NAME-$VERSION
cd $NAME

# Create control
tee -a $RPM_FOLDER/SPECS/$NAME.spec > /dev/null <<EOT
%define fullname $PACKAGE

Name: $NAME
Version: $VERSION
Release: $REVISION
Summary: An application that provides an easy start in the Aurora OS ecosystem.

License: Apache-2.0
Group: Development/Tools
Url: https://github.com/keygenqt/aurora-toolbox
Source: source.tar.gz

BuildRequires: meson
BuildRequires: libgjs-devel
BuildRequires: libgtk4-devel
BuildRequires: libadwaita-devel >= 1.5

Requires: sudo
Requires: xdg-desktop-portal-xapp
Requires: libgjs
Requires: libgtk4-gir
Requires: libadwaita-gir
Requires: libsoup3.0-gir

%description
%summary.

%prep
%setup

%build
%meson
%meson_build

%install
%meson_install
mkdir -p %{buildroot}%{_datadir}/applications
mkdir -p %{buildroot}%{_datadir}/icons
install ./build/data/%{fullname}.svg %{buildroot}%{_datadir}/icons/%{fullname}.svg
install ./build/data/%{fullname}.desktop %{buildroot}%{_datadir}/applications/%{fullname}.desktop

%post
ln -sf %{_bindir}/%{fullname} %{_bindir}/%{name}

%files
%doc CHANGELOG.md
%{_bindir}/%{fullname}
%{_datadir}/%{fullname}/%{fullname}.data.gresource
%{_datadir}/%{fullname}/%{fullname}.src.gresource
%{_datadir}/applications/%{fullname}.desktop
%{_datadir}/glib-2.0/schemas/%{fullname}.gschema.xml
%{_datadir}/icons/%{fullname}.svg
%{_datadir}/locale/ru/LC_MESSAGES/%{fullname}.mo
EOT

# Build
rpmbuild -bb $RPM_FOLDER/SPECS/$NAME.spec

# Move
rm -rf ./build/$FOLDER/rpm
mkdir -p ./build/$FOLDER/rpm
mv $RPM_FOLDER/RPMS/x86_64/$NAME_RPM ./build/$FOLDER/rpm/$NAME_RPM
rm -rf $RPM_FOLDER
