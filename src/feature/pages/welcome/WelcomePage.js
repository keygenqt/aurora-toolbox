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

import './elements/WelcomeConnect.js';
import './elements/WelcomeLoading.js';
import './elements/WelcomeNotFound.js';
import './elements/WelcomeUpdate.js';

const WelcomePageStates = Object.freeze({
	LOADING:	1,
	NOT_FOUND:	2,
	CONNECT:	3,
	UPDATE:		4,
});

export const WelcomePage = GObject.registerClass({
	GTypeName: 'AtbWelcomePage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/welcome/WelcomePage.ui',
	InternalChildren: [
		'IdLoading',
		'IdNotFound',
		'IdConnect',
		'IdUpdate',
	],
}, class extends Adw.NavigationPage {
	#window

	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.WelcomePage;
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
		this.#loadingConnect();
	}

	#loadingConnect() {
		this.#statePage(WelcomePageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			const auroraCLI = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.appVersions())
			);
			const auroraToolbox = (await this.utils.helper.httpRequest(
				this.utils.constants.App.latestRelease
			))?.body?.parseMultipleJson();
			return {
				code: 200,
				cliLatest: String(auroraCLI?.value?.LATEST) !== 'undefined' ? auroraCLI?.value?.LATEST : undefined,
				cliInstalled: String(auroraCLI?.value?.INSTALLED) !== 'undefined' ? auroraCLI?.value?.INSTALLED : undefined,
				toolboxLatest: auroraToolbox?.tag_name ?? undefined,
				toolboxInstalled: this.utils.constants.App.version
			}
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					// Failed to retrieve data
					if (response.cliLatest === undefined) {
						response.cliLatest = response.cliInstalled;
					}
					if (response.toolboxLatest === undefined) {
						response.toolboxLatest = response.toolboxInstalled;
					}
					// Check new version
					const hasNewVersionCLI = response.cliInstalled !== response.cliLatest;
					const hasNewVersionToolbox = response.toolboxInstalled !== response.toolboxLatest;
					// If has new version
					if (hasNewVersionToolbox) {
						this.#setStateUpdate(response.toolboxLatest, true);
						this.#statePage(WelcomePageStates.UPDATE);
						return
					}
					else if (hasNewVersionCLI) {
						this.#setStateUpdate(response.cliLatest, false);
						this.#statePage(WelcomePageStates.UPDATE);
						return
					}
					else {
						// If first app open
						if (settings.get_boolean('first-open')) {
							this._IdConnect.version = `${response.cliInstalled}`;
							this.#statePage(WelcomePageStates.CONNECT);
							return
						}
						// Open tools
						this.#window.navigation().push(this.utils.constants.Pages.ToolsPage);
					}
				} else {
					this.#statePage(WelcomePageStates.NOT_FOUND);
				}
			} catch(e) {
				this.#statePage(WelcomePageStates.NOT_FOUND);
				this.utils.log.error(e);
			}
		});
	}

	#statePage(state) {
		this.childrenHide(
			'IdLoading',
			'IdNotFound',
			'IdConnect',
			'IdUpdate',
		);
		if (state == WelcomePageStates.LOADING) {
			return this.childrenShow('IdLoading');
		}
		if (state == WelcomePageStates.NOT_FOUND) {
			return this.childrenShow('IdNotFound');
		}
		if (state == WelcomePageStates.CONNECT) {
			return this.childrenShow('IdConnect');
		}
		if (state == WelcomePageStates.UPDATE) {
			return this.childrenShow('IdUpdate');
		}
	}

	#setStateUpdate(version, isAPP) {
		if (isAPP) {
			this._IdUpdate.app_name = 'Aurora Toolbox';
			this._IdUpdate.version = version;
			this._IdUpdate.link = this.utils.constants.App.docInstall;
		} else {
			this._IdUpdate.app_name = 'Aurora CLI';
			this._IdUpdate.version = version;
			this._IdUpdate.link = this.utils.constants.AppCLI.docInstall;
		}
	}
});
