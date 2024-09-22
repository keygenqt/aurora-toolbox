#!/bin/bash

############################
## Build flatpak application
############################

rm -r build-dir

flatpak run org.flatpak.Builder --force-clean --user --install build-dir com.keygenqt.aurora-toolbox.yml

flatpak run com.keygenqt.aurora-toolbox
