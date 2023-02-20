import { onMounted } from "vue";
import { EditorState, Extension } from "@codemirror/state"
import {
    EditorView,
    lineNumbers,
    highlightActiveLineGutter,
} from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { foldGutter } from "@codemirror/language"
import { basicSetup } from "codemirror"

const useEditor = (init: () => string, onchange: (v: string) => void, dom: () => HTMLElement) => {
    const exclude = [lineNumbers(), foldGutter(), highlightActiveLineGutter()]
    const sameExtension: (a: any, b: any) => boolean = (a, b) => {
        if (a.length && !b.length) return false
        if (b.length && !a.length) return false
        if (a.length !== b.length) return false
        if (!a.length && !b.length) return a.__proto__ === b.__proto__
        return Array.from({ length: a.length }).map((j, i) => i).reduce((prev, i) => prev && sameExtension(a[i], b[i]), true)
    }
    let debounce: NodeJS.Timeout
    onMounted(() => {
        setTimeout(() => {
            let startState = EditorState.create({
                doc: init(),
                extensions: [
                    (basicSetup as Extension[]).filter(i => !exclude.find(ex => sameExtension(ex, i))),
                    markdown({ codeLanguages: languages }),
                    EditorView.updateListener.of(function (e) {
                        clearTimeout(debounce)
                        debounce = setTimeout(() => onchange(e.state.doc.toString()), 350)
                    })
                ]
            })
            new EditorView({
                state: startState,
                parent: dom(),
            })
        }, 50) // fix not got init doc value aftre hmr, because editor is not double-way binding.
    })
}

export { useEditor }