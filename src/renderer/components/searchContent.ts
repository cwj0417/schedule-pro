export const useSearchContent = (input: any, field: any) => (stickies: any[]) => {
    if (!stickies?.length) return stickies;
    if (!input.value) return stickies;
    return stickies.filter(sticky => getHighlightedText(sticky[field], input.value));
  }

export const getHighlightedText = (text: string, search: string) => {
    if (!search) {
        return [{
            match: text,
            highlight: false
        }]
    }
    if (!text.includes(search)) {
        return false
    } else {
        const result = text.match(new RegExp(search + '|.?', 'gi'));
        return result!.map(match => {
            if (match.toLowerCase() === search.toLowerCase()) {
                return {
                    match,
                    highlight: true
                }
            } else {
                return {
                    match,
                    highlight: false
                }
            }
        })
    }
}