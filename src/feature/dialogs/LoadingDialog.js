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

export const LoadingDialog = GObject.registerClass({
	GTypeName: 'AtbLoadingDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/dialogs/LoadingDialog.ui',
	InternalChildren: [
		'IdLoading',
		'IdLoadingText',
		'IdSuccess',
		'IdError',
	],
}, class extends Adw.AlertDialog {
	constructor(params) {
		super(params);
		this.#hideWidgets();
		this.childrenShow('IdLoading', 'IdLoadingText');
	}

	state(message) {
		this._IdLoadingText.label = message;
		this.#hideWidgets();
		this.childrenShow('IdLoading', 'IdLoadingText');
	}

	success(message) {
		this._IdSuccess.label = message;
		this.add_response('cancel', _('Close'));
		this.#hideWidgets();
		this.childrenShow('IdSuccess');
	}

	error(message) {
		this._IdError.label = message;
		this.add_response('cancel', _('Exit'));
		this.#hideWidgets();
		this.childrenShow('IdError');
	}

	#hideWidgets() {
		this.childrenHide(
			'IdLoading',
			'IdLoadingText',
			'IdSuccess',
			'IdError',
		);
	}
});
