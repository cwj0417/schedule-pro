const { fs, join, invoke, Buffer } = (window as any).apis
import { onMounted } from 'vue';
import {
    EditorView,
    keymap,
    KeyBinding,
    ViewPlugin,
    DecorationSet,
    Decoration,
    WidgetType,
} from "@codemirror/view"
import { deleteCharBackward } from '@codemirror/commands';

export const useImgDnPPlugin = () => {
    let userPath: string
    const delImage: KeyBinding = {
        key: "Backspace",
        run: (view: EditorView) => {
            const anchor = view.state.selection.main.anchor
            const pictureRegex = /!\[([^\]]+)\]\(([^\)]+)\)$/;
            const isMatched = [...view.state.doc].join('').slice(0, anchor).match(pictureRegex)
            if (isMatched) {
                const [string, , url] = isMatched;
                view.dispatch({
                    changes: {
                        from: anchor - string.length - 1,
                        to: anchor,
                        insert: ''
                    }
                })
                try {
                    if (url.startsWith('file')) {
                        fs.unlinkSync(url.substring(7));
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                deleteCharBackward(view);
            }
            return true
        }
    }
    class ImageWidget extends WidgetType {
        constructor(private alt: string, private url: string) {
            super();
        }
        eq(prev: ImageWidget) {
            return prev.url === this.url && prev.alt === this.alt;
        }
        toDOM() {
            const img = document.createElement("img");
            img.style.width = '100px';
            img.alt = this.alt;
            img.title = this.alt;
            img.src = this.url;
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                if (img.style.width === '100px') {
                    img.style.width = '100%';
                } else {
                    img.style.width = '100px';
                }
            });
            return img;
        }
    }

    const createImage = (view: EditorView) => {
        const text = [...view.state.doc].join('')
        const pictureRegex = /!\[([^\]]+)\]\(([^\)]+)\)/g;
        const matched = [];
        let isMatched: boolean | null | RegExpExecArray = true;
        while (isMatched) {
            isMatched = pictureRegex.exec(text);
            if (isMatched) {
                const dec = Decoration.widget({
                    widget: new ImageWidget(isMatched[1], isMatched[2])
                })
                matched.push(dec.range(isMatched.index + isMatched[0].length))
            }
        }
        return Decoration.set(matched);
    }

    const imagePlugin = ViewPlugin.fromClass(class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = createImage(view);
        }
        update(update: any) {
            if (update.docChanged || update.viewportChanged)
                this.decorations = createImage(update.view);
        }
    }, {
        decorations: v => v.decorations,
    })

    const saveImageToCache = (file: File, cb: (fname: string) => void) => {
        const fileName = join(userPath, 'imgcache', Date.now() + file.name)
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = () => {
            const fcontent = reader.result as string
            fs.writeFileSync(fileName, Buffer.Buffer(fcontent))
            cb(fileName)
        }
    }
    const ImageDropAndPaste = [keymap.of([delImage]), imagePlugin, EditorView.domEventHandlers({
        paste(event: any, view) {
            if (event.clipboardData?.items?.[0]?.type?.startsWith('image')) {
                const file = event.clipboardData.items[0].getAsFile()!;
                saveImageToCache(file, (filename) => {
                    view.dispatch({
                        changes: {
                            from: view.state.selection.main.anchor,
                            insert: `\n![${file.name}](file://${filename})`
                        }
                    })
                })
            }
        },
        drop(event: any, view) {
            if (event.dataTransfer?.items?.[0]?.type?.startsWith('image')) {
                const file = event.dataTransfer?.items?.[0]?.getAsFile()!;
                saveImageToCache(file, (filename) => {
                    view.dispatch({
                        changes: {
                            from: event.target.cmView.posAtEnd,
                            insert: `\n![${file.name}](file://${filename})`
                        }
                    })
                })
            }
        }
    })];
    onMounted(() => {
        invoke('getUserPath')
            .then((path: string) => {
                userPath = path
                if (!fs.existsSync(join(path, 'imgcache'))) {
                    fs.mkdirSync(join(path, 'imgcache'))
                }
            })
        
    })
    return ImageDropAndPaste
}
