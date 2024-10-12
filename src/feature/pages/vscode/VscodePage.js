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

const VscodePageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
});

export const VscodePage = GObject.registerClass({
	GTypeName: 'AtbVscodePage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/vscode/VscodePage.ui',
	InternalChildren: [
		'IdVscodeBoxPage',
		'IdPreferencesPage',
		'IdVscodeInfoGroup',
		'IdVscodeInfo',
		'IdVscodeLoading',
		'IdVscodeEmpty',
		'IdPageRefresh',
		'IdGroupExtensions',
	],
}, class extends Adw.NavigationPage {
	// Start
	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.VscodePage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdVscodeLoading',
			'IdVscodeEmpty',
			'IdPageRefresh',
		);
		if (state == VscodePageStates.LOADING) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdVscodeLoading');
		}
		if (state == VscodePageStates.EMPTY) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdVscodeEmpty', 'IdPageRefresh');
		}
		if (state == VscodePageStates.DONE) {
			this._IdVscodeBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
	}

	#initData() {
		this.#statePage(VscodePageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			return this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.vscodeInfo())
			);
			// @todo Next step - get list extensions
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(VscodePageStates.DONE);
				} else {
					this.#statePage(VscodePageStates.EMPTY);
					this.utils.log.error(response);
				}
			} catch(e) {
				this.#statePage(VscodePageStates.EMPTY);
				this.utils.log.error(response);
			}
		});
	}

	#initPage(info) {
		this._IdVscodeInfo.icon = 'aurora-toolbox-vscode';
		this._IdVscodeInfo.title = _('Visual Studio Code');
		this._IdVscodeInfo.subtitle = info.VERSION;
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('VscodeTool', {
			'run': () => this.connectors.exec.communicateAsync(['code']),
			'updateSettings': () => console.log('updateSettings')
		});
	}
});
