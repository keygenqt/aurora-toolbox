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
	],
}, class extends Adw.NavigationPage {
	#state

	// Start
	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.EmulatorPage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		this.#state = state
		this.childrenHide(
			'IdPreferencesPage',
			'IdEmulatorLoading',
			'IdEmulatorEmpty',
			'IdEmulatorStart',
			'IdPageRefresh',
		);
		if (state == EmulatorPageStates.LOADING) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdEmulatorLoading');
		}
		if (state == EmulatorPageStates.EMPTY) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdEmulatorEmpty', 'IdPageRefresh');
		}
		if (state == EmulatorPageStates.DONE) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
		if (state == EmulatorPageStates.START) {
			this._IdEmulatorBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdEmulatorStart');
		}
	}

	#initData() {
		this.#statePage(EmulatorPageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			return this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorInfo())
			);
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(EmulatorPageStates.DONE);
				} else if (response && response.code === 100) {
					this.#statePage(EmulatorPageStates.START);
				} else {
					this.#statePage(EmulatorPageStates.EMPTY);
					this.utils.log.error(response)
				}
			} catch(e) {
				this.#statePage(EmulatorPageStates.EMPTY);
				this.utils.log.error(response)
			}
		});
	}

	#initPage(info) {
		this._IdEmulatorInfo.icon = 'aurora-toolbox-multiple-devices';
		this._IdEmulatorInfo.title = info.PRETTY_NAME;
		this._IdEmulatorInfo.subtitle = info.ARCH;
	}

	#actionsConnect() {
		// @todo
		this.connectGroup('EmulatorTool', {
			'terminal': () => console.log('terminal'),
            'install': () => console.log('install'),
            'remove': () => console.log('remove'),
            'run': () => console.log('run'),
            'upload': () => console.log('upload'),
        });
		this._IdPageRefresh.connect('clicked', () => this.#refresh());
		this._IdEmulatorStart.connect('button-clicked', () => {
			this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorStart());
			this.#loadEmulatorStart();
		});
	}

	#loadEmulatorStart() {
		this.#statePage(EmulatorPageStates.LOADING);
        new Promise(async (resolve) => {
			try {
				await new Promise(r => setTimeout(r, 500));
				const response = await this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorInfo());
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
