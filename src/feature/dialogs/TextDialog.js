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

import { Helper } from '../../base/utils/Helper.js';

export const TextDialog = GObject.registerClass({
	GTypeName: 'AtbTextDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/TextDialog.ui',
	Properties: Helper.makeParams({
        'title': 'string',
        'subtitle': 'string',
		'placeholder': 'string',
    }),
	InternalChildren: [
		'IdEntry',
		'IdLoading',
		'IdSuccess',
		'IdError',
	],
	Signals: {
		'cancel': {},
		'submit': {
			param_types: [GObject.TYPE_STRING]
		},
		'validate': {
			param_types: [GObject.TYPE_STRING],
			return_type: GObject.TYPE_BOOLEAN
		},
	},
}, class extends Adw.AlertDialog {
	#isSubmit = false

	constructor(params) {
		super(params);
		this.#initProperties();
		this.#actionsConnect();
		this.#hideWidgets();
		this.childrenShow('IdEntry');
	}

	#initProperties() {
		// title
		this.heading = this['title'];
		this.connect('notify::title', () => {
			this.heading = this['title'];
		});
		// subtitle
		this.body = this['subtitle'];
		this.connect('notify::subtitle', () => {
			this.body = this['subtitle'];
		});
		// placeholder
		this._IdEntry.set_placeholder_text(this['placeholder']);
		this.connect('notify::placeholder', () => {
			this._IdEntry.set_placeholder_text(this['placeholder']);
		});
	}

	cancel() {
		if (!this.#isSubmit) {
			this.emit('cancel');
		}
	}

	close() {
		this.#isSubmit = true;
		super.close();
	}

	loading() {
		this.#hideWidgets();
		this.childrenShow('IdLoading');
		this.body = this['subtitle'];
		this.set_response_enabled('cancel', false);
	}

	success(message) {
		this._IdSuccess.label = message;
		this.#hideWidgets();
		this.childrenShow('IdSuccess');
		this.body = '';
		this.set_response_enabled('cancel', true);
		this.set_response_label('cancel', _('Close'));
	}

	error(message) {
		this._IdError.label = message;
		this.#hideWidgets();
		this.childrenShow('IdError');
		this.body = '';
		this.set_response_enabled('cancel', true);
		this.set_response_label('cancel', _('Exit'));
	}

	#hideWidgets() {
		this.childrenHide(
			'IdEntry',
			'IdLoading',
			'IdSuccess',
			'IdError',
		);
	}

	#actionsConnect() {
		this._IdEntry.connect('activate', (entry) => {
			entry.editable = false;
			entry.remove_css_class('InputError');
			const text = entry.get_text();
			if (this.emit('validate', text)) {
				this.emit('submit', text);
			} else {
				entry.add_css_class('InputError');
			}
			entry.editable = true;
		});
	}
});
