/**
 * Copyright 2024 Vitaliy Zarubin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

import { DBusProxy } from '../base/connectors/DBusProxy.js';

import './widgets/GroupBoxWidget.js';
import './widgets/NavigationWidget.js';
import './widgets/PageBoxWidget.js';

export const Window = GObject.registerClass({
	GTypeName: 'AtbWindow',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/Window.ui',
	InternalChildren: [
		'IdAtbNavigation'
	],
}, class extends Adw.ApplicationWindow {
	#dbusProxy;

	constructor(params) {
		super(params);
		this.#initConnects();
		this.#bindSettings();
	}

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}

	#bindSettings() {
		settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#initConnects() {
		const mode = settings.get_int('light-on-dark');
		if (mode === 0) {
			if (this.#dbusProxy === undefined) {
				this.#dbusProxy = new DBusProxy();
			}
			this.#dbusProxy.connectWithEmit('colorScheme', (value) => {
				this.#changeAppearanceCss(value);
			});
		} else {
			this.#changeAppearanceCss(mode - 1);
		}
	}

	#changeAppearanceCss(colorScheme = 0) {
		if (colorScheme === 1) {
			this.add_css_class('is-dark');
			this.remove_css_class('is-light');
		} else {
			this.add_css_class('is-light');
			this.remove_css_class('is-dark');
		}
	}

	navigation() {
		return this._IdAtbNavigation;
	}
});
