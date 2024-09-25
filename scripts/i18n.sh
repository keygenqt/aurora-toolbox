#!/bin/bash

###################################
## Generating the Translation Files
###################################

FOLDER='build-dir'

cat po/LINGUAS | while read _l; do touch po/${_l}.po; done

meson setup $FOLDER
meson compile -C $FOLDER com.keygenqt.aurora-toolbox-update-po
rm -rf $FOLDER
