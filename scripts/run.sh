#!/bin/bash

##########################
## Build meson application
##########################

meson setup \
    -Dbindir=/home/$USER/.local/bin \
    -Ddatadir=/home/$USER/.local/share \
    -Dlibdir=/home/$USER/.local/lib \
    -Dprefix=/home/$USER/.local \
    build-dir

ninja -C build-dir install

/home/$USER/.local/bin/com.keygenqt.aurora-toolbox
