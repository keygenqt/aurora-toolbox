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

import { AppConstants } from '../../base/constants/AppConstants.js';
import { Helper } from '../../base/utils/Helper.js';
import { AuroraAPI } from '../../base/constants/AuroraAPI.js';
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
	],
}, class extends Gtk.Widget {
	present(window) {
		// this._IdSettingsDialog.present(window);
		// this.#actionsConnect();

		const loadingDialog = new LoadingDialog().present(window);
		Helper.communicateAsync(AuroraAPI.settingsList())
			.then((response) => {
				loadingDialog.close();
				this._IdSettingsDialog.present(window);
				this.#setData(response.value);
				this.#actionsConnect();
			})
			.catch((e) => {
				// @todo
			})
	}

	#setData(value) {
		const language = value?.language === 'ru' ? AppConstants.Language.ru : AppConstants.Language.en;
		const verbose = value?.verbose === 'true';
		const select = value?.select === 'true';
		const hint = value?.hint === 'true' || value?.hint !== 'false' && value?.hint !== 'true';

		this._IdSelectLanguage.selected = language === AppConstants.Language.ru ? 0 : 1;
		this._IdSwitchVerbose.active = verbose;
		this._IdSwitchSelect.active = select;
		this._IdSwitchHint.active = hint;
	}

	#actionsConnect() {
		this._IdSettingsDialog.connectGroup('AtbSettingsDialog', {
            'hint': () => console.log('hint'),
            'select': () => console.log('select'),
            'verbose': () => console.log('verbose'),
        });
		this._IdSelectLanguage.connect('notify::selected-item', (e) => {
			console.log(e.get_selected())
		});
	}
});
