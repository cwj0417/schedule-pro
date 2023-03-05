import { onMounted } from "vue";
import { EditorSelection, EditorState } from "@codemirror/state"
import {
    EditorView, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap, KeyBinding
} from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';

const bold: KeyBinding = {
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
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                        bold,
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