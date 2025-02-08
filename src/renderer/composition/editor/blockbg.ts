import {
    EditorView,
    KeyBinding,
    ViewPlugin,
    DecorationSet,
    Decoration,
    keymap,
} from "@codemirror/view"
import { RangeSetBuilder, EditorSelection } from "@codemirror/state"

const createBgDecro = (view: EditorView) => {
    const text = [...view.state.doc].join('')
    // #1#content$$
    const bgRegex = /#(\d)#(.+)(\$\$)/g
    let builder = new RangeSetBuilder<Decoration>()
    let isMatched: boolean | null | RegExpExecArray = true;
    while (isMatched) {
        isMatched = bgRegex.exec(text);
        if (isMatched) {
            // bg color
            builder.add(isMatched.index, isMatched.index + isMatched[0].length, Decoration.mark({
                attributes: {
                    style: `background-color: var(--sticky-${isMatched[1]})`
                }
            }))
            // prefix small text
            builder.add(isMatched.index, isMatched.index + 3, Decoration.mark({
                attributes: {
                    style: `font-size: 10px`
                }
            }))
            // postfix small text
            builder.add(isMatched.index + isMatched[0].length - 2, isMatched.index + isMatched[0].length, Decoration.mark({
                attributes: {
                    style: `font-size: 10px`
                }
            }))
        }
    }
    return builder.finish()
}

const bgRenderer = ViewPlugin.fromClass(class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
        this.decorations = createBgDecro(view)
    }
    update(update: any) {
        if (update.docChanged || update.viewportChanged)
            this.decorations = createBgDecro(update.view)
    }
}, {
    decorations: (v) => v.decorations,
})

const getKeyBinding: (i: number) => KeyBinding = (i) => {
    return {
        key: `Mod-${i}`,
        run: (view: EditorView) => {
            view.dispatch(view.state.changeByRange(range => {
                let content = view.state.doc.sliceString(range.from, range.to)
                const originLenth = content.length;
                const isMatched = /^#(\d)#.*\$\$$/.exec(content)
                if (isMatched) {
                    if (isMatched[1] === i.toString()) {
                        content = content.replace(/^#\d#(.*)\$\$$/, '$1');
                    } else {
                        content = content.replace(/^#\d#(.*)\$\$$/, '#' + i.toString() + '#' + '$1' + '$$$');
                    }
                } else {
                    content = `#${i}#${content}$$`;
                }
                return {
                    changes: [{ from: range.from, to: range.to, insert: content }],
                    range: EditorSelection.range(range.from, range.to - originLenth + content.length),
                }
            }))
            return true;
        }
    }
}
export const blockbg = [bgRenderer, keymap.of([1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => getKeyBinding(i)))]