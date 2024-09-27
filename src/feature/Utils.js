import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

export const addSimpleActions = (actions, group = new Gio.SimpleActionGroup()) => {
    for (const [name, func] of Object.entries(actions)) {
        const action = new Gio.SimpleAction({ name });
        action.connect('activate', func);
        group.add_action(action);
    }
    return group;
}

export const uriLaunch = (window, url) => {
    const launcher = new Gtk.UriLauncher();
    launcher.uri = url;
    launcher.launch(window, null, (launcher, res) => {
        try {
            launcher.launch_finish(res);
        } catch (err) {
            logError(err);
        }
    });
}

export const logError = (error) => {
    console.error(error);
}
