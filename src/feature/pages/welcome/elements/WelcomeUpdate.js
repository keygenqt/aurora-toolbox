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
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { Helper } from '../../../../base/utils/Helper.js';

export const WelcomeUpdate = GObject.registerClass({
	GTypeName: 'AtbWelcomeUpdate',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/welcome/elements/WelcomeUpdate.ui',
	Properties: Helper.makeParams({
        'app-name': 'string',
        'version': 'string',
        'link': 'string',
    }),
	InternalChildren: [
		'IdVersion',
		'IdButton',
	],
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		this.#actionsConnect();
		this.#initProperties();
	}

	#actionsConnect() {
		this._IdButton.connect('clicked', () => {
			if (this['link']) {
				this.utils.helper.uriLaunch(this.get_native(), this['link']);
			}
		});
	}

	#initProperties() {
		this._IdVersion.label = `${this['app-name']} v${this['version']}`;
		this.connect('notify::version', () => {
			this._IdVersion.label = `${this['app-name']}: v${this['version']}`;
		})
	}
});
