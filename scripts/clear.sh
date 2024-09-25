#!/bin/bash

##########################
## Clear build application
##########################

FOLDER='build-dir'

ninja -C $FOLDER uninstall
rm -r $FOLDER
