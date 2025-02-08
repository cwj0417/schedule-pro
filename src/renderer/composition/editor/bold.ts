import {
    EditorView,
    KeyBinding,
} from "@codemirror/view"

import { EditorSelection } from "@codemirror/state"

export const bold: KeyBinding = {
    key: "Mod-b",
    run: (view: EditorView) => {
        view.dispatch(view.state.changeByRange(range => {
            let content = view.state.doc.sliceString(range.from, range.to)
            const originLenth = content.length;
            const isBold = /^\*\*.*\*\*$/.test(content);
            if (isBold) {
                content = content.replace(/^\*\*(.*)\*\*$/, '$1');
            } else {
                content = `**${content.replace(/^\**([^\*]*)\**$/g, '$1')}**`;
            }
            return {
                changes: [{ from: range.from, to: range.to, insert: content }],
                range: EditorSelection.range(range.from, range.to - originLenth + content.length),
            }
        }))
        return true;
    }
}