#!/bin/bash

###################################
## Generating the Translation Files
###################################

FOLDER='build-dir'

# Read files
find data -type f -name "*.ui" && find src -type f -name "*.js" > po/POTFILES

# Read languages
cat po/LINGUAS | while read lang; do
    if [ ! -e "po/$lang.po" ]; then
        cat > "po/$lang.po" <<CONTENT_TYPE
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8"
CONTENT_TYPE
    fi
done

# Build app
meson setup $FOLDER

# Build po
meson compile -C $FOLDER com.keygenqt.aurora-toolbox-update-po

# Clear
rm -rf $FOLDER
