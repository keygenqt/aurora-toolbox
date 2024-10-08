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
	],
}, class extends Adw.NavigationPage {
	// Start
	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.VscodePage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		if (state == VscodePageStates.LOADING) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdVscodeLoading.visible = true;
			this._IdVscodeEmpty.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == VscodePageStates.EMPTY) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdVscodeLoading.visible = false;
			this._IdVscodeEmpty.visible = true;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == VscodePageStates.DONE) {
			this._IdVscodeBoxPage.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdVscodeLoading.visible = false;
			this._IdVscodeEmpty.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
	}

	#initData() {
		this.#statePage(VscodePageStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.vscodeInfo())
			.catch((e) => Log.error(e))
			.then(async (response) => {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(VscodePageStates.DONE);
				} else {
					this.#statePage(VscodePageStates.EMPTY);
					Log.error(response)
				}
			});
	}

	#initPage(info) {
		this._IdVscodeInfo.icon = 'aurora-toolbox-vscode';
		this._IdVscodeInfo.name = _('Visual Studio Code');
		this._IdVscodeInfo.arch = info.VERSION;
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('VscodeTool', {
			'run': () => ShellExec.communicateAsync(['code']),
		});
	}
});
