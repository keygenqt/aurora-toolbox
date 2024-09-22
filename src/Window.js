import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const Window = GObject.registerClass({
	GTypeName: 'AtbWindow',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/Window.ui',
}, class extends Gtk.ApplicationWindow {
	constructor(params={}) {
		super(params);
		this.#bindSizeToSettings();
	}

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}

	#bindSizeToSettings() {
		// Bind the width and height to the settings
		settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}
});
