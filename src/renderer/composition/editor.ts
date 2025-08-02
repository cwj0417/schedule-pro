import { onMounted } from "vue";
import { EditorSelection, EditorState } from "@codemirror/state"
import {
    EditorView,
    highlightSpecialChars,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    keymap,
} from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { useImgDnPPlugin } from "./editor/imgdnp";
import { bold } from "./editor/bold";
import { blockbg } from "./editor/blockbg";

const useEditor = (init: () => string, onchange: (v: string) => void, dom: () => HTMLElement) => {
    let debounce: NodeJS.Timeout
    const ImageDropAndPaste = useImgDnPPlugin()
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
            }),
            ImageDropAndPaste,
            blockbg,
        ]
    })
    new EditorView({
        state: startState,
        parent: dom(),
    }).focus()
}

export { useEditor }
