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
		'IdButtonOpenTerminalUser',
		'IdButtonOpenTerminalRoot',
	],
}, class extends Adw.NavigationPage {
	#window
	#info

	// Start
	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.EmulatorPage;
		this.#actionsConnect();
		this.#initData();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
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
			const info = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorInfo())
			);
			return {
				'code': info.code,
				'info': this.utils.helper.getValueResponse(info, 'value'),
				'isTerminal': await this.utils.helper.isExistGnomeTerminal(),
			}
		}).then((response) => {
			try {
				if (response.info && response.code === 200) {
					this.#initPage(response.info, response.isTerminal);
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

	#initPage(info, isTerminal) {
		this.#info = info;
		this._IdEmulatorInfo.icon = 'aurora-toolbox-multiple-devices';
		this._IdEmulatorInfo.title = info.PRETTY_NAME;
		this._IdEmulatorInfo.subtitle = info.ARCH;
		this._IdButtonOpenTerminalUser.visible = isTerminal;
		this._IdButtonOpenTerminalRoot.visible = isTerminal;
	}

	#actionsConnect() {
		this.connectGroup('EmulatorTool', {
			'terminalUser': () => this.#openTerminalConnectSSH('defaultuser'),
			'terminalRoot': () => this.#openTerminalConnectSSH('root'),
            'install': () => this.#installPackage(),
            'remove': () => this.#deletePackage(),
            'run': () => this.#runPackage(),
            'upload': () => this.#uploadFile(),
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

	#openTerminalConnectSSH(user) {
		this.connectors.exec
			.communicateAsync(this.connectors.shell.gnomeTerminalOpen(
				`ssh -o 'ConnectTimeout=2' -o 'StrictHostKeyChecking=no' ${user}@${this.#info.HOST} -p ${this.#info.PORT} -i ${this.#info.KEY}`
			));
	}

	#deletePackage() {
		var dialog = this.utils.creator.textDialog(
			this.#window,
			_('Delete package'),
			_('Specify the name of the package you want to delete.'),
			'com.package.name',
			/* validate */ (text) => {
				if (text.split('.').length !== 3) {
					return false;
				}
				return true;
			},
			/* success */ (text) => {
				dialog.loading();
				this.utils.helper.getPromisePage(async () => {
					const resultAPM = this.utils.helper.getLastObject(
						await this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorPackageRemove(text, true))
					);
					if (resultAPM.code == 200) {
						return {code: 200};
					}
					const resultPkcon = this.utils.helper.getLastObject(
						await this.connectors.exec.communicateAsync(this.connectors.aurora.emulatorPackageRemove(text, false))
					);
					if (resultPkcon.code == 200) {
						return {code: 200};
					}
					return {code: 500};
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The package has been removed successfully!'));
					} else {
						dialog.error(_(`Failed to remove package, please provide a valid package name.`));
					}
				});
			},
		);
	}

	#runPackage() {
		var dialog = this.utils.creator.textDialog(
			this.#window,
			_('Run package'),
			_('Specify the name of the package you want to run.'),
			'com.package.name',
			/* validate */ (text) => {
				if (text.split('.').length !== 3) {
					return false;
				}
				return true;
			},
			/* success */ (text) => {
				dialog.loading();
				this.utils.helper.getPromisePage(async () => {
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.emulatorPackageRun(text),
						/* valid */	 () => true,
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.close();
					} else {
						dialog.error(_(`Failed to run package, please provide a valid package name.`));
					}
				});
			},
		);
	}

	#installPackage() {
		this.utils.creator.selectFileDialog(
			this.#window,
			new Gtk.FileFilter({
				name: _('RPM package'),
				mime_types: ['application/x-rpm'],
			}),
			/* success */ (uri) => {
				const path = uri.replace('file://', '');
				const dialog = this.utils.creator.loadingDialog(this.#window);
				this.utils.helper.getPromisePage(async () => {
					const isAPM = this.#info.VERSION_ID.includes('5.1.');
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.emulatorPackageInstall(path, isAPM),
						/* valid */	 (object) => {
							if (object && object.code === 100) {
								if (object.value) {
									dialog.state(_(`Loading... (${object.value}%)`));
								}
								return false;
							} else {
								return true;
							}
						},
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The package was installed successfully!'));
					} else {
						dialog.error(_('Failed to install package. Please provide a valid package file.'));
					}
				});
			},
		);
	}

	#uploadFile() {
		this.utils.creator.selectFileDialog(
			this.#window,
			new Gtk.FileFilter({
				name: _('All Files'),
				patterns: ['*'],
			}),
			/* success */ (uri) => {
				const path = uri.replace('file://', '');
				const dialog = this.utils.creator.loadingDialog(this.#window);
				this.utils.helper.getPromisePage(async () => {
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.emulatorUpload(path),
						/* valid */	 (object) => {
							if (object && object.code === 100) {
								if (object.value) {
									dialog.state(_(`Loading... (${object.value}%)`));
								}
								return false;
							} else {
								return true;
							}
						},
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The file has been successfully downloaded to the ~/Download directory!'));
					} else {
						dialog.error(_('Error loading file, something went wrong.'));
					}
				});
			},
		);
	}
});
