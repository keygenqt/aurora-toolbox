#!/bin/bash

##########################
## Clear build application
##########################

ninja -C build-dir uninstall
rm -r build-dir
