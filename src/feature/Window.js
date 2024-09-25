import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

import { AppBusProxy } from './AppBusProxy.js';

export const Window = GObject.registerClass({
	GTypeName: 'AtbWindow',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/Window.ui',
}, class extends Adw.Window {
	#dbusProxy = new AppBusProxy();

	constructor(params={}) {
		super(params);

		this.#bindSizeToSettings();
		this.#changeAppearance(this.#dbusProxy.colorScheme);

		this.#dbusProxy.connect('color-scheme', (_, value) => {
			this.#changeAppearance(value);
		});
	}

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}

	#bindSizeToSettings() {
		settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#changeAppearance(colorScheme = 0) {
		if (colorScheme === 1) {
			this.add_css_class('is-dark');
			this.remove_css_class('is-light');
		} else {
			this.add_css_class('is-light');
			this.remove_css_class('is-dark');
		}
	}
});
