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

const PsdkPageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
	ERROR:		4,
	REMOVE:		5,
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
		'IdError',
		'IdRemove',
		'IdPageRefresh',
		'IdButtonOpenTerminal',
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
		this.tag = this.utils.constants.Pages.PsdkPage;
		this.#actionsConnect();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	vfunc_map() {
		super.vfunc_map();
		const params = this.#window.navigation().params(this.utils.constants.Pages.PsdkPage);
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
		this._IdError.connect('button-clicked', () => {
			this.#refresh();
		});
		this._IdRemove.connect('button-clicked', () => {
			this.#window.navigation().pop(this.utils.constants.Pages.PsdksPage, {
				refresh: true
			});
		});
		this.connectGroup('PsdkTool', {
			'terminal': () => {
				this.connectors.exec
					.communicateAsync(this.connectors.shell.gnomeTerminalOpen(this.#tool))
			},
			'sign': () => this.#signRPM(),
			'sudoersAdd': () => this.utils.creator.authRootDialog(this.#window, () => {
				this.connectors.exec.communicateAsync(this.connectors.aurora.psdkSudoersAdd(this.#params.version));
				this.#stateSudoersPage(true);
			}),
			'sudoersDel': () => this.utils.creator.authRootDialog(this.#window, () => {
				this.connectors.exec.communicateAsync(this.connectors.aurora.psdkSudoersDel(this.#params.version));
				this.#stateSudoersPage(false);
			}),
			'remove': () => this.#removeFlutterSDK(this.#params.version)
		});
	}

	#stateSudoersPage(isSudoers) {
		this._IdButtonSudoersAdd.visible = !isSudoers;
		this._IdButtonSudoersDel.visible = isSudoers;
	}

	#statePage(state, message = undefined) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdLoading',
			'IdEmpty',
			'IdError',
			'IdRemove',
			'IdPageRefresh',
		);
		if (state == PsdkPageStates.LOADING) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			this._IdLoading.showLoading(message);
			return this.childrenShow('IdLoading');
		}
		if (state == PsdkPageStates.EMPTY) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdEmpty', 'IdPageRefresh');
		}
		if (state == PsdkPageStates.DONE) {
			this._IdBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
		if (state == PsdkPageStates.ERROR) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdError');
		}
		if (state == PsdkPageStates.REMOVE) {
			this._IdBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdRemove');
		}
	}

	#initData() {
		this.#clear();
		this.#statePage(PsdkPageStates.LOADING, _('Getting data...'));
		this.utils.creator.authPsdkDialog(
			this.#window,
			this.#params.version,
			// Success
			() => this.utils.helper.getPromisePage(async () => {
				const info = this.utils.helper.getLastObject(
					await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkInfo(this.#params.version))
				);
				const targets = this.utils.helper.getLastObject(
					await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkTargets(this.#params.version))
				);
				return {
					'tool': this.utils.helper.getValueResponse(info, 'TOOL'),
					'isSudoers': this.utils.helper.getValueResponse(info, 'SUDOERS', false),
					'targets': this.utils.helper.getValueResponse(targets, 'value', []),
					'isTerminal': await this.utils.helper.isExistGnomeTerminal(),
				}
			}).then((response) => {
				try {
					if (response.tool !== undefined) {
						this.#tool = response.tool;
						this.#targets = response.targets;
						this.#initPage(response.isTerminal);
						this.#initTargetsGroup();
						this.#stateSudoersPage(response.isSudoers);
						this.#statePage(PsdkPageStates.DONE);
					} else {
						this.#statePage(PsdkPageStates.EMPTY);
						this.utils.log.error(response);
					}
				} catch(e) {
					this.#statePage(PsdkPageStates.ERROR);
					this.utils.log.error(response);
				}
			}),
			// Cancel
			() => this.#statePage(PsdkPageStates.ERROR)
		);
	}

	#initPage(isTerminal) {
		this._IdInfo.icon = 'aurora-toolbox-psdk';
		this._IdInfo.title = _('Platform SDK');
		this._IdInfo.subtitle = this.#params.version;
		this._IdButtonOpenTerminal.visible = isTerminal;
	}

	#initTargetsGroup() {
		this.#targets.forEach((target) => {
			const widget = this.utils.creator.actionRow(target, () => {
				this.#window.navigation().push(this.utils.constants.Pages.PsdkTargetPage, {
					target: target,
					psdkVersion: this.#params.version,
				});
			});
			// Add to active group
			this._IdTargetsGroup.add(widget);
			// Save widget
			this.#targetsWidgets.push(widget);
		});
	}

	#removeFlutterSDK(version) {
		this.utils.creator.alertDialog(
			this.#window,
			_('Remove'),
			_(`Do you want remove "${version}" PSDK?`),
			() => {
				this.utils.creator.authRootDialog(this.#window, () => {
					this.#statePage(PsdkPageStates.LOADING, _('Remove...'));
					this.utils.helper.getPromisePage(async () => {
						const resultRun = this.utils.helper.getLastObject(
							await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkRemove(version))
						);
						return {
							code: resultRun.code,
							message: resultRun.message,
						};
					}).then((response) => {
						if (response.code === 200) {
							this.#statePage(PsdkPageStates.REMOVE);
						} else {
							this.#statePage(PsdkPageStates.ERROR);
						}
					});
				});
			}
		);
	}

	#signRPM() {
		this.utils.creator.selectFileDialog(
			this.#window,
			new Gtk.FileFilter({
				name: _('Sign RPM'),
				mime_types: ['application/x-rpm'],
			}),
			/* success */ (path) => {
				this.utils.creator.authRootDialog(this.#window, () => {
					const dialog = this.utils.creator.loadingDialog(this.#window);
					this.utils.helper.getPromisePage(async () => {
						const resultRun = this.utils.helper.getLastObject(
							await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkPackageSign(path, this.#params.version))
						);
						return {
							code: resultRun.code,
							message: resultRun.message,
						};
					}).then((response) => {
						if (response && response.code === 200) {
							dialog.success(response.message);
						} else {
							dialog.error(_('Error loading file, something went wrong.'));
						}
					});
				});
			},
		);
	}
});
