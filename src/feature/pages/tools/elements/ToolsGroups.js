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

export const ToolsGroups = GObject.registerClass({
	GTypeName: 'AtbToolsGroups',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/tools/elements/ToolsGroups.ui',
	InternalChildren: [
		'IdGroupSDK',
		'IdGroupPSDK',
		'IdGroupFlutter',
		'IdGroupVscode',
		'IdGroupDevices',
		'IdGroupEmulator',
	],
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		// State hint
		this.#setStateHint();
	}

	#setStateHint() {
		if (!this.utils.helper.getHintAPI()) {
			this._IdGroupSDK.subtitle = null;
			this._IdGroupPSDK.subtitle = null;
			this._IdGroupFlutter.subtitle = null;
			this._IdGroupVscode.subtitle = null;
			this._IdGroupDevices.subtitle = null;
			this._IdGroupEmulator.subtitle = null;
		}
	}
});
