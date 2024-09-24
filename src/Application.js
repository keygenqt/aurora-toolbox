import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

import './WelcomeWidget.js';
import { Window } from './Window.js';

export const Application = GObject.registerClass({
	GTypeName: 'AtbApplication'
}, class extends Adw.Application {
	
	vfunc_startup() {
		super.vfunc_startup();
		this.#loadStylesheet();
		this.#loadSettings();
	}

	vfunc_activate() {
		const window = new Window({ application: this });
		window.present();
	}

	#loadStylesheet() {
		// Load the stylesheet in a CssProvider
		const provider = new Gtk.CssProvider();
		provider.load_from_resource('/com/keygenqt/aurora-toolbox/css/style.css');

		// Add the provider to the StyleContext of the default display
		Gtk.StyleContext.add_provider_for_display(
			Gdk.Display.get_default(),
			provider,
			Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
		);
	}

	#loadSettings() {
		// Load the settings
		globalThis.settings = new Gio.Settings({ schemaId: this.applicationId });
	}
});
