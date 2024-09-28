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

export const SettingsDialog = GObject.registerClass({
	GTypeName: 'AtbSettingsDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/SettingsDialog.ui',
	InternalChildren: ['IdSettingsDialog', 'IdSelectLanguage'],
}, class extends Gtk.Widget {
	present(window) {
		this._IdSettingsDialog.present(window);
		this.#actionsConnect();
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
