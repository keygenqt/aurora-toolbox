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
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

import { Helper } from '../base/utils/Helper.js';
import { Window } from './Window.js';

export const Application = GObject.registerClass({
	GTypeName: 'AtbApplication',
}, class extends Adw.Application {

	constructor(params) {
        super(params);
		Helper.setLanguage(Helper.getLanguageAPI());
	}

	vfunc_startup() {
		super.vfunc_startup();
		this.#loadStylesheet();
		this.#loadSettings();
	}

	vfunc_activate() {
		new Window({ application: this }).present();
	}

	#loadStylesheet() {
		const provider = new Gtk.CssProvider();
		provider.load_from_resource('/com/keygenqt/aurora-toolbox/css/style.css');
		Gtk.StyleContext.add_provider_for_display(
			Gdk.Display.get_default(),
			provider,
			Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
		);
	}

	#loadSettings() {
		globalThis.settings = new Gio.Settings({ schemaId: this.applicationId });
	}
});
