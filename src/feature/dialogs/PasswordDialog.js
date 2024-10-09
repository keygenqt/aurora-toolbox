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

import { Log } from '../../base/utils/Log.js';
import { ShellExec } from '../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../base/connectors/AuroraAPI.js';

const PasswordDialogStates = Object.freeze({
	LOADING:	1,
	INPUT:		2,
});

export const PasswordDialog = GObject.registerClass({
	GTypeName: 'AtbPasswordDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/PasswordDialog.ui',
	InternalChildren: [
		'IdPasswordEntry',
		'IdPasswordLoading',
	],
}, class extends Adw.AlertDialog {
	#callbackAuth
	#callbackCancel
	#cancel

	present(window, callbackAuth, callbackCancel) {
		this.#callbackAuth = callbackAuth;
		this.#callbackCancel = callbackCancel;
		super.present(window);
		this.#actionsConnect();
	}

	cancel() {
		this.#cancel = true;
		if (this.#callbackCancel) {
			this.#callbackCancel();
		}
	}

	#statePage(state) {
		if (state == PasswordDialogStates.LOADING) {
			this._IdPasswordEntry.visible = false;
			this._IdPasswordLoading.visible = true;
			return
		}
		if (state == PasswordDialogStates.INPUT) {
			this._IdPasswordEntry.visible = true;
			this._IdPasswordLoading.visible = false;
			return
		}
	}

	authRootPsdk(window, version, callbackAuth, callbackCancel) {
		ShellExec.communicateAsync(AuroraAPI.appAuthCheck(version))
			.catch((e) => Log.error(e))
			.then((response) => {
				if (response && response.code === 200 && response.value) {
					callbackAuth();
				} else {
					this.present(window, callbackAuth, callbackCancel);
				}
			});
	}

	/**
     *  Auth to sudo
     */
	authRoot(window, callbackAuth, callbackCancel) {
		ShellExec.communicateAsync(AuroraAPI.appAuthCheck())
			.catch((e) => Log.error(e))
			.then((response) => {
				if (response && response.code === 200 && response.value) {
					callbackAuth();
				} else {
					this.present(window, callbackAuth, callbackCancel);
				}
			});
	}

	#actionsConnect() {
		this._IdPasswordEntry.connect('activate', (entry) => {
			this.#statePage(PasswordDialogStates.LOADING);
			entry.editable = false;
			entry.remove_css_class('InputError');
			const password = entry.get_text();
			this.#validatePassword(password)
				.catch((e) => {
					if (!this.#cancel) {
						entry.add_css_class('InputError');
						Log.debug(e.message);
						entry.editable = true;
						this.#statePage(PasswordDialogStates.INPUT);
					}
				})
				.then((result) => {
					if (!this.#cancel && result) {
						this.#callbackCancel = undefined;
						this.#callbackAuth();
						this.close();
					}
				});
		});
	}

	#validatePassword(password) {
		return new Promise(async (resolve, reject) => {
			try {
				if (password.length === 0) {
					throw new Error('Empty password.');
				}
				const response = await ShellExec.communicateAsync(AuroraAPI.appAuthRoot(password));
				if (!response || response.code !== 200 || !response.value) {
					throw new Error('Empty validate password.');
				}
				resolve(true);
			} catch (e) {
				reject(e)
			}
		});
	}
});
