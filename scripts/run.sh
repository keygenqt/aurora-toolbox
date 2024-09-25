#!/bin/bash

##########################
## Build meson application
##########################

FOLDER='build-dir'

meson setup \
    -Dbindir=/home/$USER/.local/bin \
    -Ddatadir=/home/$USER/.local/share \
    -Dlibdir=/home/$USER/.local/lib \
    -Dprefix=/home/$USER/.local \
    $FOLDER

ninja -C $FOLDER install

/home/$USER/.local/bin/com.keygenqt.aurora-toolbox
