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

export const ShellAPI = {
    /**
     * Get version Gnome TextEditor
     *
     * @returns route
     */
    gnomeTextEditorVersion: function() {
        return ['gnome-text-editor', '--version'];
    },
    /**
     * Open file default editor
     *
     * @returns route
     */
    gnomeTextEditorOpen: function(path) {
        return ['gnome-text-editor', path];
    },
    /**
     * Get version Gnome Terminal
     *
     * @returns route
     */
    gnomeTerminalVersion: function() {
        return ['gnome-terminal', '--version'];
    },
    /**
     * Open file default editor
     *
     * @returns route
     */
    gnomeTerminalOpen: function(command) {
        return ['gnome-terminal', '--', 'bash', '-c', command];
    },
    /**
     * Open file default editor
     *
     * @returns route
     */
    xdgOpen: function(path) {
        return ['xdg-open', path];
    },
};
