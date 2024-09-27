#!/bin/bash

###################################
## Generating the Translation Files
###################################

FOLDER='build-dir'

cat po/LINGUAS | while read _l; do touch po/${_l}.po && sed --in-place po/${_l}.po --expression='s/CHARSET/UTF-8/'; done

meson setup $FOLDER
meson compile -C $FOLDER com.keygenqt.aurora-toolbox-update-po
rm -rf $FOLDER
