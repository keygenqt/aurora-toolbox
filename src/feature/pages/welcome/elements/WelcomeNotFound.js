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
import { AppConstants } from '../../../../base/constants/AppConstants.js';

export const WelcomeNotFound = GObject.registerClass({
	GTypeName: 'AtbWelcomeNotFound',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/welcome/elements/WelcomeNotFound.ui',
	InternalChildren: [
		'IdUbuntuGroup',
		'IdUbuntuBtn',
		'IdUbuntuLabel',
		'IdUbuntuLoading',
		'IdLinuxGroup',
		'IdLinuxBtn',
	],
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		this.#statePage(Helper.isUbuntuSystem());
	}

	#statePage(isUbuntu) {
		if (isUbuntu) {
			this._IdUbuntuGroup.visible = true;
			this._IdLinuxGroup.visible = false;
			this._IdUbuntuBtn.connect('clicked', () => {
				this.#installOnUbuntuAuroraCLI();
			});
		} else {
			this._IdUbuntuGroup.visible = false;
			this._IdLinuxGroup.visible = true;
			this._IdLinuxBtn.connect('clicked', () => {
				Helper.uriLaunch(this.get_native(), AppConstants.App.documentationInstall);
			});
		}
	}

	#installOnUbuntuAuroraCLI() {
		// @todo
		console.log('Install Aurora CLI');
		this._IdUbuntuBtn.visible = false;
		this._IdUbuntuLabel.visible = false;
		this._IdUbuntuLoading.visible = true;
	}
});
