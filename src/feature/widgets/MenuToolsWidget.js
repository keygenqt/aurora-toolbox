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
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';


export const MenuToolsWidget = GObject.registerClass({
	GTypeName: 'AtbMenuToolsWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/MenuToolsWidget.ui',
	InternalChildren: [
		'IdTest',
	],
}, class extends Gtk.Widget {
	constructor(params) {
		super(params);
		this.#actionsConnect();
	}

	#actionsConnect() {
		this.connectGroup('MenuTools', {
            'test': () => {
				console.log('yes')
			},
        });
	}

	#addSimpleActions = (actions, group = new Gio.SimpleActionGroup()) => {
		for (const [name, func] of Object.entries(actions)) {
			const action = new Gio.SimpleAction({ name })
			action.connect('activate', func)
			group.add_action(action)
		}
		return group
	}
});
