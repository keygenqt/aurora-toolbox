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

import { Helper } from '../../base/utils/Helper.js';

const PageBoxStates = Object.freeze({
	LOADING:	1,
	STATE:		2,
});

export const PageBoxWidget = GObject.registerClass({
	GTypeName: 'AtbPageBoxWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/PageBoxWidget.ui',
	Properties: Helper.makeParams({
        'icon-name': 'string',
        'message': 'string',
        'button-icon': 'string',
        'button-text': 'string',
    }),
	InternalChildren: [
		'IdPageBoxSpinner',
		'IdPageBoxSpinnerMessage',
		'IdPageBoxIcon',
		'IdPageBoxMessage',
		'IdPageBoxButton',
		'IdPageBoxButtonContent',
	],
	Signals: {
		'button-clicked': {},
	},
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		this.#actionsConnect();
		this.#initProperties();
		this.#statePage(PageBoxStates.STATE);
	}

	showLoading(message = undefined) {
		this._IdPageBoxSpinnerMessage.label = message ?? '';
		this.#statePage(PageBoxStates.LOADING);
	}

	showState(icon_name, message) {
		this['icon-name'] = icon_name;
		this['message'] = message;
		this.#statePage(PageBoxStates.STATE);
	}

	showButton(button_text, button_icon = undefined) {
		this['button-text'] = button_text;
		this['button-icon'] = button_icon;
		this.#statePage(PageBoxStates.STATE);
	}

	#statePage(state) {
		this.childrenHide(
			'IdPageBoxSpinner',
			'IdPageBoxIcon',
			'IdPageBoxMessage',
			'IdPageBoxButton',
			'IdPageBoxButtonContent',
			'IdPageBoxSpinnerMessage',
		);
		if (state == PageBoxStates.LOADING) {
			if (Boolean(this._IdPageBoxSpinnerMessage.label)) {
				this.childrenShow('IdPageBoxSpinnerMessage');
			}
			return this.childrenShow('IdPageBoxSpinner');
		}
		if (state == PageBoxStates.STATE) {
			if (Boolean(this['message'])) {
				this.childrenShow('IdPageBoxMessage');
			}
			if (Boolean(this['icon-name'])) {
				this.childrenShow('IdPageBoxIcon');
			}
			if (Boolean(this['button-text'])) {
				this.childrenShow('IdPageBoxButton');
				if (Boolean(this['button-icon'])) {
					this.childrenShow('IdPageBoxButtonContent');
					this._IdPageBoxButtonContent.set_icon_name(this['button-icon']);
					this._IdPageBoxButtonContent.label = this['button-text'];
				} else {
					this._IdPageBoxButton.label = this['button-text'];
				}
			}
			return
		}
	}

	#actionsConnect() {
		this._IdPageBoxButton.connect('clicked', () => {
			this.emit('button-clicked');
		});
	}

	#initProperties() {
		// icon-name
		this._IdPageBoxIcon.set_from_icon_name(this['icon-name']);
		this.connect('notify::icon-name', () => {
			this._IdPageBoxIcon.set_from_icon_name(this['icon-name']);
		});
		// message
		this._IdPageBoxMessage.label = this['message'];
		this.connect('notify::message', () => {
			this._IdPageBoxMessage.label = this['message'];
		});
		// button-text
		this.connect('notify::button-icon', () => this.#statePage(PageBoxStates.STATE));
		// button-icon
		this.connect('notify::button-text', () => this.#statePage(PageBoxStates.STATE));
	}
});
