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

export const IconInfoBoxWidget = GObject.registerClass({
	GTypeName: 'AtbIconInfoBoxWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/IconInfoBoxWidget.ui',
	Properties: Helper.makeParams({
        'icon': 'string',
        'title': 'string',
        'subtitle': 'string',
    }),
	InternalChildren: [
		'IdDeviceInfoBoxIcon',
		'IdDeviceInfoBoxName',
		'IdDeviceInfoBoxArch',
	],
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		this.#initProperties();
	}

	#initProperties() {
		// icon
		this._IdDeviceInfoBoxIcon.set_from_icon_name(this['icon']);
		this.connect('notify::icon', () => {
			this._IdDeviceInfoBoxIcon.set_from_icon_name(this['icon']);
		})
		// title
		this._IdDeviceInfoBoxName.label = this['title'];
		this.connect('notify::title', () => {
			this._IdDeviceInfoBoxName.label = this['title'];
		})
		// subtitle
		this._IdDeviceInfoBoxArch.label = this['subtitle'];
		this.connect('notify::subtitle', () => {
			this._IdDeviceInfoBoxArch.label = this['subtitle'];
		})
	}
});
