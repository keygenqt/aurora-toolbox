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

export const InfoDialog = GObject.registerClass({
	GTypeName: 'AtbInfoDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/InfoDialog.ui',
	InternalChildren: [
		'IdText',
	],
}, class extends Adw.AlertDialog {
	constructor(params) {
		super(params);
		this.#hideWidgets();
	}

	present(window, message) {
		this.#hideWidgets();
		if (message) {
			this._IdText.label = message;
			this.childrenShow('IdText');
		}
		super.present(window);
	}

	#hideWidgets() {
		this.childrenHide(
			'IdIcon',
			'IdText',
		);
	}
});
