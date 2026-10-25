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
import { indentOnInput, syntaxHighlighting, HighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { tags as t } from "@lezer/highlight"
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

// 自定义高亮配色:默认样式的颜色(如 markdown 标记 #、>、** 的 #404740)在深色模式下看不清,
// 改用主题 CSS 变量,深浅色模式都能正常显示
const appHighlightStyle = HighlightStyle.define([
    { tag: t.meta, color: "var(--color-2)" },
    { tag: t.link, textDecoration: "underline", color: "var(--theme-1)" },
    { tag: t.heading, textDecoration: "underline", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.keyword, color: "var(--theme-1)" },
    { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: "var(--theme-1)" },
    { tag: [t.literal, t.inserted], color: "var(--success-1)" },
    { tag: [t.string, t.deleted], color: "var(--error-1)" },
    { tag: [t.regexp, t.escape, t.special(t.string)], color: "var(--warning-1)" },
    { tag: t.definition(t.variableName), color: "var(--color-0)" },
    { tag: t.local(t.variableName), color: "var(--color-0)" },
    { tag: [t.typeName, t.namespace], color: "var(--success-1)" },
    { tag: t.className, color: "var(--theme-1)" },
    { tag: [t.special(t.variableName), t.macroName], color: "var(--color-1)" },
    { tag: t.definition(t.propertyName), color: "var(--theme-1)" },
    { tag: t.comment, color: "var(--color-3)" },
    { tag: t.invalid, color: "var(--error-0)" },
])

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
            syntaxHighlighting(appHighlightStyle),
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
