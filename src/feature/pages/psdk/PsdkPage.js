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
import { ShellAPI } from '../../../base/connectors/ShellAPI.js';
import { Log } from '../../../base/utils/Log.js';

import { AlertDialog } from '../../dialogs/AlertDialog.js';
import { PasswordDialog } from '../../dialogs/PasswordDialog.js';

const PsdkPageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
	ERROR:		4,
});

export const PsdkPage = GObject.registerClass({
	GTypeName: 'AtbPsdkPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/psdk/PsdkPage.ui',
	InternalChildren: [
		'IdBoxPage',
		'IdPreferencesPage',
		'IdInfoGroup',
		'IdTargetsGroup',
		'IdInfo',
		'IdLoading',
		'IdEmpty',
		'IdPageRefresh',
		'IdButtonTerminal',
		'IdButtonSudoersAdd',
		'IdButtonSudoersDel',
	],
}, class extends Adw.NavigationPage {
	#window
	#params
	#tool
	#targets = []
	#targetsWidgets = []

	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.PsdkPage;
		this.#actionsConnect();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	vfunc_map() {
		super.vfunc_map();
		const params = this.#window.navigation().params(AppConstants.Pages.PsdkPage);
		if (this.#params?.version !== params.version) {
			this.#params = params;
			this.#initData();
		}
	}

	#refresh() {
		this.#initData();
	}

	#clear() {
		for (let step = 0; step < this.#targetsWidgets.length; step++) {
			this._IdTargetsGroup.remove(this.#targetsWidgets[step]);
		}
		this.#targets = [];
		this.#targetsWidgets = [];
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('PsdkTool', {
			'sudoersAdd': () => new PasswordDialog().authRoot(this.#window, () => {
				ShellExec.communicateAsync(AuroraAPI.psdkSudoersAdd(this.#params.version));
				this.#stateSudoersPage(true);
			}),
			'sudoersDel': () => new PasswordDialog().authRoot(this.#window, () => {
				ShellExec.communicateAsync(AuroraAPI.psdkSudoersDel(this.#params.version));
				this.#stateSudoersPage(false);
			}),
			'terminal': () => {
				ShellExec.communicateAsync(ShellAPI.gnomeTerminalOpen(this.#tool)).catch(() => {});
			},
			'remove': () => {
				new AlertDialog().present(
					this.#window,
					_('Remove'),
					_(`Do you want remove "${this.#params.version}" PSDK?`),
					() => {
						// @todo
						console.log(`Remove dialog: ${this.#params.version}`);
					}
				);
			},
		});
	}

	#stateSudoersPage(isSudoers) {
		this._IdButtonSudoersAdd.visible = !isSudoers;
		this._IdButtonSudoersDel.visible = isSudoers;
	}

	#statePage(state) {
		if (state == PsdkPageStates.LOADING) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdLoading.visible = true;
			this._IdEmpty.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == PsdkPageStates.EMPTY) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdLoading.visible = false;
			this._IdEmpty.visible = true;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == PsdkPageStates.DONE) {
			this._IdBoxPage.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdLoading.visible = false;
			this._IdEmpty.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == PsdkPageStates.ERROR) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdLoading.visible = false;
			this._IdEmpty.visible = true;
			this._IdPageRefresh.visible = false;
			return
		}
	}

	#initData() {
		this.#clear();
		this.#statePage(PsdkPageStates.LOADING);
		new PasswordDialog().authRootPsdk(this.#window, this.#params.version, () => {
			new Promise(async (resolve, reject) => {
				try {
					// Get info
					const response10 = await ShellExec.communicateAsync(AuroraAPI.psdkInfo(this.#params.version));
					const response11 = Array.isArray(response10) ? response10.slice(-1)[0] : response10;
					// Get targets
					const response20 = await ShellExec.communicateAsync(AuroraAPI.psdkTargets(this.#params.version));
					const response21 = Array.isArray(response20) ? response20.slice(-1)[0] : response20;
					// Get state terminal
					const isTerminal = await this.#isExistGnomeTerminal();
					// Response
					resolve({
						'tool': response11 && response11.code === 200 ? response11.value.TOOL : undefined,
						'targets': response21 && response21.code === 200 ? response21.value : [],
						'isTerminal': isTerminal,
						'isSudoers': response11 && response11.code === 200 ? response11.value.SUDOERS : false
					});
				} catch (e) {
					reject(e)
				}
			})
				.catch((e) => Log.error(e))
				.then((response) => {
					if (response.tool !== undefined) {
						this.#tool = response.tool;
						this.#targets = response.targets;
						this.#initPage(response.isTerminal);
						this.#initTargetsGroup();
						this.#stateSudoersPage(response.isSudoers);
						this.#statePage(PsdkPageStates.DONE);
					} else {
						this.#statePage(PsdkPageStates.EMPTY);
						Log.error(response)
					}
				});
		}, () => {
			this.#statePage(PsdkPageStates.ERROR);
			this.#params = undefined;
		});
	}

	#initPage(isTerminal) {
		this._IdInfo.icon = 'aurora-toolbox-psdk';
		this._IdInfo.name = _('Platform SDK');
		this._IdInfo.arch = this.#params.version;
		this._IdButtonTerminal.visible = isTerminal;
	}

	#initTargetsGroup() {
		this.#targets.forEach((target) => {
			const widget = this.#createItem(target);
			// Add to active group
			this._IdTargetsGroup.add(widget);
			// Save widget
			this.#targetsWidgets.push(widget);
		});
	}

	#createItem(target) {
		// Create action
		const actions = {};
		const group = `group-${target.replaceAll('.', '_')}`;
		const action = `action-${target.replaceAll('.', '_')}`;
		// Create widget
		const actionRow = new Adw.ActionRow({
			'title': target,
			'action-name': `${group}.${action}`,
		});
		// Action add icon
		actionRow.add_suffix(new Gtk.Image({
			'icon-name': 'go-next',
		}));
		// Activatable on yourself
		actionRow.set_activatable_widget(actionRow);
		// Add object action
		actions[action] = () => {
			// @todo page target
			this.#window.navigation().push(AppConstants.Pages.DevicePage, target);
		}
		// Activate action
		actionRow.connectGroup(group, actions);

		return actionRow;
	}

	async #isExistGnomeTerminal() {
		try {
			const output = await ShellExec.communicateAsync(ShellAPI.gnomeTerminalVersion());
			return output.filter((line) => line.includes('GNOME Terminal')).length === 1;
		} catch (e) {
			return false;
		}
	}
});
