#!/bin/bash

###################################
## Generating the Translation Files
###################################

FOLDER='build-dir'

# Read files
rm po/POTFILES
find data -type f -name "*.ui" >> po/POTFILES
find src -type f -name "*.js" >> po/POTFILES

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

meson setup $FOLDER
meson compile -C $FOLDER com.keygenqt.aurora-toolbox-pot
meson compile -C $FOLDER com.keygenqt.aurora-toolbox-update-po

# Clear
rm -rf $FOLDER
