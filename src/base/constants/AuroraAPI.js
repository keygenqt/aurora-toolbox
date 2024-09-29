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
import { AppConstants } from './AppConstants.js'

export const AuroraAPI = {
    /**
     * Test types answer from API
     *
     * @param {number} time - sleep ms
     * @param {number} code - response types
     * @param {number} iterate - multiple answer
     * @returns route
     */
    testAnswer: function(time = 0, code = 200, iterate = 1) {
        return [
            ...AppConstants.AuroraCLI, 'api', '--route',
            '/tests/answer'.argUri({
                time: time,
                code: code,
                iterate: iterate,
            })
        ]
    },
    /**
     * Get list settings from API
     *
     * @returns route
     */
    settingsList: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/settings/list'
        ]
    }
};
