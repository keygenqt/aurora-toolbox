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

export const PsdkTargetPage = GObject.registerClass({
	GTypeName: 'AtbPsdkTargetPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/psdkTarget/PsdkTargetPage.ui',
	InternalChildren: [
		'IdPsdkTargetBoxPage',
		'IdPreferencesPage',
		'IdPsdkTargetInfoGroup',
		'IdPsdkTargetInfo',
	],
}, class extends Adw.NavigationPage {
	#window
	#params

	// Start
	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.PsdkTargetPage;
		this.#actionsConnect();
	}

	// Create
	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	// Open
	vfunc_map() {
		super.vfunc_map();
		this.#params = this.#window.navigation().params(this.utils.constants.Pages.PsdkTargetPage);
		this.#initPage();
	}

	#initPage() {
		this._IdPsdkTargetInfo.icon = 'aurora-toolbox-target';
		this._IdPsdkTargetInfo.title = this.#params.target;
		this._IdPsdkTargetInfo.subtitle = _(`PSDK ${this.#params.psdkVersion}`);
	}

	#actionsConnect() {
		this.connectGroup('PsdkTargetTool', {
			'install': () => {
				// @todo
				console.log('install')
			},
			'remove': () => {
				// @todo
				console.log('remove')
			},
			'clearSnapshot': () => {
				// @todo
				console.log('clearSnapshot')
			},
		});
	}
});
