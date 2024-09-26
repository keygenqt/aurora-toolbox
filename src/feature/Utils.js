import Gio from 'gi://Gio';

export const addSimpleActions = (actions, group = new Gio.SimpleActionGroup()) => {
    for (const [name, func] of Object.entries(actions)) {
        const action = new Gio.SimpleAction({ name })
        action.connect('activate', func)
        group.add_action(action)
    }
    return group
}
