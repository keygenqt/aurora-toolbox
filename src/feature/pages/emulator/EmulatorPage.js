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
import Gtk from 'gi://Gtk';

import { AppConstants } from '../../../base/constants/AppConstants.js';
import { ShellExec } from '../../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../../base/connectors/AuroraAPI.js';
import { Log } from '../../../base/utils/Log.js';

const EmulatorPageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
	START:		4,
});

export const EmulatorPage = GObject.registerClass({
	GTypeName: 'AtbEmulatorPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/emulator/EmulatorPage.ui',
	InternalChildren: [
		'IdEmulatorBoxPage',
		'IdPreferencesPage',
		'IdEmulatorInfoGroup',
		'IdEmulatorInfo',
		'IdEmulatorLoading',
		'IdEmulatorEmpty',
		'IdEmulatorStart',
		'IdPageRefresh',
		'IdGroupInstallRPM',
	],
}, class extends Adw.NavigationPage {
	#state

	// Start
	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.EmulatorPage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		this.#state = state
		if (state == EmulatorPageStates.LOADING) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdEmulatorLoading.visible = true;
			this._IdEmulatorEmpty.visible = false;
			this._IdEmulatorStart.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == EmulatorPageStates.EMPTY) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdEmulatorLoading.visible = false;
			this._IdEmulatorEmpty.visible = true;
			this._IdEmulatorStart.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == EmulatorPageStates.DONE) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdEmulatorLoading.visible = false;
			this._IdEmulatorEmpty.visible = false;
			this._IdEmulatorStart.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == EmulatorPageStates.START) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdEmulatorLoading.visible = false;
			this._IdEmulatorEmpty.visible = false;
			this._IdEmulatorStart.visible = true;
			this._IdPageRefresh.visible = false;
			return
		}
	}

	#initData() {
		this.#statePage(EmulatorPageStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.emulatorInfo())
			.catch((e) => Log.error(e))
			.then(async (response) => {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(EmulatorPageStates.DONE);
				} else if (response && response.code === 100) {
					this.#statePage(EmulatorPageStates.START);
				} else {
					this.#statePage(EmulatorPageStates.EMPTY);
					Log.error(response)
				}
			});
	}

	#initPage(info) {
		this._IdEmulatorInfo.icon = 'aurora-toolbox-multiple-devices';
		this._IdEmulatorInfo.name = info.PRETTY_NAME;
		this._IdEmulatorInfo.arch = info.ARCH;
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this._IdEmulatorStart.connect('button-clicked', () => {
			ShellExec.communicateAsync(AuroraAPI.emulatorStart());
			this.#loadEmulatorStart();
		});
		// @todo
		this.connectGroup('EmulatorTool', {
            'install': () => {
				console.log('Install')
			},
			'upload': () => {
				console.log('Upload')
			}
        });
	}

	#loadEmulatorStart() {
		this.#statePage(EmulatorPageStates.LOADING);
        new Promise(async (resolve) => {
			try {
				await new Promise(r => setTimeout(r, 500));
				const response = await ShellExec.communicateAsync(AuroraAPI.emulatorInfo());
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(EmulatorPageStates.DONE);
					resolve(true);
				} else {
					this.#loadEmulatorStart();
					resolve(false);
				}
			} catch (e) {
				console.log(e)
			}
        });
	}
});
