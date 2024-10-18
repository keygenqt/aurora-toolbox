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

import { appRestart } from '../../main.js';
import { Helper } from '../../base/utils/Helper.js';

import { ShellExec } from '../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../base/connectors/AuroraAPI.js';

import { ErrorDialog } from './ErrorDialog.js';
import { LoadingDialog } from './LoadingDialog.js';

export const SettingsDialog = GObject.registerClass({
	GTypeName: 'AtbSettingsDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/SettingsDialog.ui',
	InternalChildren: [
		'IdSettingsDialog',
		'IdSelectLanguage',
		'IdSwitchVerbose',
		'IdSwitchSelect',
		'IdSwitchHint',
		'IdBannerRestart',
	],
}, class extends Gtk.Widget {
	#loadingDialog = new LoadingDialog();

	present(window) {
		this.#loadingDialog.present(window);
		ShellExec.communicateAsync(AuroraAPI.settingsList())
			.then((response) => {
				// Close loading
				this.#loadingDialog.closeAsync();
				// Check error
				if (response.code === 500) {
					new ErrorDialog().present(window, response.message);
				}
				// Error loading settings
				else if (response.value === undefined) {
					new ErrorDialog().present(window, _('Error load settings.'));
				}
				// Show dialog settings
				else {
					this._IdSettingsDialog.present(window);
					this.#setParams(response.value);
					this.#actionsConnect();
					this.#showInfoRestart();
				}
			})
			.catch((e) => {
				// Close loading
				this.#loadingDialog.closeAsync();
				// Show error
				new ErrorDialog().present(window, _('Error load settings.'));
			})
	}

	#setParams(value) {
		this._IdSelectLanguage.selected = value?.language === 'ru' ? 0 : 1;
		this._IdSwitchVerbose.active = value?.verbose === 'true';
		this._IdSwitchSelect.active = value?.select === 'true';
		this._IdSwitchHint.active = value?.hint === 'true' || value?.hint !== 'false' && value?.hint !== 'true';
	}

	#actionsConnect() {
		this._IdSwitchVerbose.connect('notify::active', (e, v) => {
			ShellExec.communicateAsync(AuroraAPI.settingsVerbose(e.active));
		});
		this._IdSwitchSelect.connect('notify::active', (e) => {
			ShellExec.communicateAsync(AuroraAPI.settingsSelect(e.active));
		});
		this._IdSwitchHint.connect('notify::active', (e) => {
			ShellExec.communicateAsync(AuroraAPI.settingsHint(e.active));
		});
		this._IdSelectLanguage.connect('notify::selected-item', (e) => {
			ShellExec.communicateAsync(
				AuroraAPI.settingsLocalization(e.get_selected() === 0 ? 'ru' : 'en'
			));
			this.#showInfoRestart();
		});
		this._IdBannerRestart.connect('button-clicked', () => {
			appRestart();
		});
	}

	#showInfoRestart() {
		const index = Helper.getLanguageENV().includes('ru') ? 0 : 1;
		this._IdBannerRestart.revealed = index != this._IdSelectLanguage.selected;
	}
});
