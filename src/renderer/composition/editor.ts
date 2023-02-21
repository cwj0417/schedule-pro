import { onMounted } from "vue";
import { EditorState } from "@codemirror/state"
import {
    EditorView, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap
} from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';

const useEditor = (init: () => string, onchange: (v: string) => void, dom: () => HTMLElement) => {
    let debounce: NodeJS.Timeout
    onMounted(() => {
        setTimeout(() => {
            let startState = EditorState.create({
                doc: init(),
                extensions: [
                    highlightSpecialChars(),
                    history(),
                    drawSelection(),
                    dropCursor(),
                    EditorState.allowMultipleSelections.of(true),
                    indentOnInput(),
                    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                    bracketMatching(),
                    closeBrackets(),
                    autocompletion(),
                    rectangularSelection(),
                    crosshairCursor(),
                    highlightActiveLine(),
                    highlightSelectionMatches(),
                    keymap.of([
                        ...closeBracketsKeymap,
                        ...defaultKeymap,
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                    ]),
                    markdown({ codeLanguages: languages }),
                    EditorView.updateListener.of(function (e: any) {
                        clearTimeout(debounce)
                        debounce = setTimeout(() => onchange(e.state.doc.toString()), 350)
                    })
                ]
            })
            new EditorView({
                state: startState,
                parent: dom(),
            }).focus()
        }, 50) // fix not got init doc value aftre hmr, because editor is not double-way binding.
    })
}

export { useEditor }