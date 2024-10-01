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
import Adw from 'gi://Adw';

/**
 * Close dialog with delay
 */
Adw.Dialog.prototype.closeAsync = async function () {
    const times = [0, 2, 5, 10, 50, 100];
    for (const time of times) {
        await new Promise(r => setTimeout(r, time));
        this.close();
    }
};
