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

import { ShellExec } from '../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../base/connectors/AuroraAPI.js';

export const WelcomeWidget = GObject.registerClass({
	GTypeName: 'AtbWelcomeWidget',
	CssName: 'AtbWelcomeWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/WelcomeWidget.ui',
	InternalChildren: [
		'IdGroupLoading',
		'IdGroupNotFound',
		'IdSubgroupUbuntu',
		'IdSubgroupLinux',
		'IdInstallBtn',
		'IdInstallLoading',
		'IdDocumentationBtn',
		'IdGroupAuroraCLI',
		'IdAuroraCLIVersion',
		'IdToolsBtn',
	],
}, class extends Gtk.Widget {

	constructor(params) {
		super(params);
		this.#showGroupSearch();
		ShellExec.communicateAsync(AuroraAPI.infoVersion())
			.catch((e) => Log.error(e))
			.then((response) => {
				if (response && response.code === 200) {
					this.#showGroupAuroraCLI(response.value);
				} else {
					this.#showGroupNotFound(true);
				}
			});
	}

	#showGroupSearch() {
		this._IdGroupLoading.visible = true;
		this._IdGroupNotFound.visible = false;
		this._IdGroupAuroraCLI.visible = false;
	}

	#showGroupNotFound(isUbuntu) {
		this._IdGroupLoading.visible = false;
		this._IdGroupNotFound.visible = true;
		this._IdGroupAuroraCLI.visible = false;
		if (isUbuntu) {
			this._IdSubgroupUbuntu = true;
			this._IdSubgroupLinux = false;
		} else {
			this._IdSubgroupUbuntu = true;
			this._IdSubgroupLinux = true;
		}
	}

	#showGroupAuroraCLI(version) {
		this._IdGroupLoading.visible = false;
		this._IdGroupNotFound.visible = false;
		this._IdGroupAuroraCLI.visible = true;
		this._IdAuroraCLIVersion.label = version;
	}
});
