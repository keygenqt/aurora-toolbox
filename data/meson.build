# Compile the resources
gnome.compile_resources(
	APP_ID + '.data',
	APP_ID + '.data.gresource.xml',
	gresource_bundle: true,
	install: true,
	install_dir: get_option('datadir') / APP_ID
)

# Install the settings schema
install_data(
	APP_ID + '.gschema.xml',
	install_dir: get_option('datadir') / 'glib-2.0' / 'schemas'
)
