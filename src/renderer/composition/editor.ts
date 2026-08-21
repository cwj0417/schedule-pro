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

// 让光标更明显:加粗到 3px 并使用亮色主题色
const enhanceCaret = EditorView.theme({
    "& .cm-cursor": {
        borderLeftWidth: "3px",
        borderLeftColor: "var(--theme-1)",
        marginLeft: "-1.5px"
    },
    "& .cm-cursor-secondary": {
        borderLeftWidth: "3px",
        borderLeftColor: "var(--theme-0)"
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "var(--theme-1) !important"
    }
})

const useEditor = (init: () => string, onchange: (v: string) => void, dom: () => HTMLElement): EditorView => {
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
            enhanceCaret,
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
    const view = new EditorView({
        state: startState,
        parent: dom(),
    })
    view.focus()
    return view
}

export { useEditor }
