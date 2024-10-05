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
import Adw from 'gi://Adw';

import { ShellExec } from '../../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../../base/connectors/AuroraAPI.js';

import { AppConstants } from '../../../base/constants/AppConstants.js';

import './elements/WelcomeConnect.js';
import './elements/WelcomeLoading.js';
import './elements/WelcomeNotFound.js';

const WelcomePageStates = Object.freeze({
	LOADING:	1,
	NOT_FOUND:	2,
	CONNECT:	3,
});

export const WelcomePage = GObject.registerClass({
	GTypeName: 'AtbWelcomePage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/welcome/WelcomePage.ui',
	InternalChildren: [
		'IdLoading',
		'IdNotFound',
		'IdConnect',
	],
}, class extends Adw.NavigationPage {
	#window

	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.WelcomePage;
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
		this.#loadingConnect();
	}

	#loadingConnect() {
		this.#statePage(WelcomePageStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.infoVersion())
			.catch((e) => Log.error(e))
			.then((response) => {
				if (response && response.code === 200) {
					// if (settings.get_boolean('first-open')) {
					// 	this.#window.navigation().push(AppConstants.Pages.ToolsPage);
					// } else {
						this.#statePage(WelcomePageStates.CONNECT);
					// }
				} else {
					this.#statePage(WelcomePageStates.NOT_FOUND);
				}
			});
	}

	#statePage(state) {
		if (state == WelcomePageStates.LOADING) {
			this._IdLoading.visible = true;
			this._IdNotFound.visible = false;
			this._IdConnect.visible = false;
			return
		}
		if (state == WelcomePageStates.NOT_FOUND) {
			this._IdLoading.visible = false;
			this._IdNotFound.visible = true;
			this._IdConnect.visible = false;
			return
		}
		if (state == WelcomePageStates.CONNECT) {
			this._IdLoading.visible = false;
			this._IdNotFound.visible = false;
			this._IdConnect.visible = true;
			return
		}
	}
});
