# Define our project
project(
	'aurora-toolbox',
	version: '0.0.1',
	license: ['Apache 2.0'],
	meson_version: '>= 0.59.0'
)

APP_ID = 'com.keygenqt.aurora-toolbox'

# Import the modules
gnome = import('gnome')
i18n = import('i18n')

# Dependencies
dependency('libadwaita-1', version : '>= 1.5')

# Load instructions from subdirectories
subdir('data')
subdir('src')
subdir('po')

# Post installation tasks
gnome.post_install(
	glib_compile_schemas: true
)
