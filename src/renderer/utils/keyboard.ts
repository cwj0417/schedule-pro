const keyCodes: {
    [keyCode: number]: {
        [platform in 'darwin' | 'win32']: {
            type: 'accelerator' | 'number' | 'normal' | 'esc',
            value: string
        }
    }
} = {
    16: { darwin: { type: 'accelerator', value: 'shift' }, win32: { type: 'accelerator', value: 'shift' } },
    17: { darwin: { type: 'accelerator', value: 'ctrl' }, win32: { type: 'accelerator', value: 'ctrl' } },
    18: { darwin: { type: 'accelerator', value: 'alt' }, win32: { type: 'accelerator', value: 'alt' } },
    27: { darwin: { type: 'esc', value: 'esc' }, win32: { type: 'esc', value: 'esc' } },
    48: { darwin: { type: 'number', value: '0' }, win32: { type: 'number', value: '0' } },
    49: { darwin: { type: 'number', value: '1' }, win32: { type: 'number', value: '1' } },
    50: { darwin: { type: 'number', value: '2' }, win32: { type: 'number', value: '2' } },
    51: { darwin: { type: 'number', value: '3' }, win32: { type: 'number', value: '3' } },
    52: { darwin: { type: 'number', value: '4' }, win32: { type: 'number', value: '4' } },
    53: { darwin: { type: 'number', value: '5' }, win32: { type: 'number', value: '5' } },
    54: { darwin: { type: 'number', value: '6' }, win32: { type: 'number', value: '6' } },
    55: { darwin: { type: 'number', value: '7' }, win32: { type: 'number', value: '7' } },
    56: { darwin: { type: 'number', value: '8' }, win32: { type: 'number', value: '8' } },
    57: { darwin: { type: 'number', value: '9' }, win32: { type: 'number', value: '9' } },
    65: { darwin: { type: 'normal', value: 'a' }, win32: { type: 'normal', value: 'a' } },
    66: { darwin: { type: 'normal', value: 'b' }, win32: { type: 'normal', value: 'b' } },
    67: { darwin: { type: 'normal', value: 'c' }, win32: { type: 'normal', value: 'c' } },
    68: { darwin: { type: 'normal', value: 'd' }, win32: { type: 'normal', value: 'd' } },
    69: { darwin: { type: 'normal', value: 'e' }, win32: { type: 'normal', value: 'e' } },
    70: { darwin: { type: 'normal', value: 'f' }, win32: { type: 'normal', value: 'f' } },
    71: { darwin: { type: 'normal', value: 'g' }, win32: { type: 'normal', value: 'g' } },
    72: { darwin: { type: 'normal', value: 'h' }, win32: { type: 'normal', value: 'h' } },
    73: { darwin: { type: 'normal', value: 'i' }, win32: { type: 'normal', value: 'i' } },
    74: { darwin: { type: 'normal', value: 'j' }, win32: { type: 'normal', value: 'j' } },
    75: { darwin: { type: 'normal', value: 'k' }, win32: { type: 'normal', value: 'k' } },
    76: { darwin: { type: 'normal', value: 'l' }, win32: { type: 'normal', value: 'l' } },
    77: { darwin: { type: 'normal', value: 'm' }, win32: { type: 'normal', value: 'm' } },
    78: { darwin: { type: 'normal', value: 'n' }, win32: { type: 'normal', value: 'n' } },
    79: { darwin: { type: 'normal', value: 'o' }, win32: { type: 'normal', value: 'o' } },
    80: { darwin: { type: 'normal', value: 'p' }, win32: { type: 'normal', value: 'p' } },
    81: { darwin: { type: 'normal', value: 'q' }, win32: { type: 'normal', value: 'q' } },
    82: { darwin: { type: 'normal', value: 'r' }, win32: { type: 'normal', value: 'r' } },
    83: { darwin: { type: 'normal', value: 's' }, win32: { type: 'normal', value: 's' } },
    84: { darwin: { type: 'normal', value: 't' }, win32: { type: 'normal', value: 't' } },
    85: { darwin: { type: 'normal', value: 'u' }, win32: { type: 'normal', value: 'u' } },
    86: { darwin: { type: 'normal', value: 'v' }, win32: { type: 'normal', value: 'v' } },
    87: { darwin: { type: 'normal', value: 'w' }, win32: { type: 'normal', value: 'w' } },
    88: { darwin: { type: 'normal', value: 'x' }, win32: { type: 'normal', value: 'x' } },
    89: { darwin: { type: 'normal', value: 'y' }, win32: { type: 'normal', value: 'y' } },
    90: { darwin: { type: 'normal', value: 'z' }, win32: { type: 'normal', value: 'z' } },
    91: { darwin: { type: 'accelerator', value: 'cmd' }, win32: { type: 'accelerator', value: '' } },
    93: { darwin: { type: 'accelerator', value: 'cmd' }, win32: { type: 'accelerator', value: '' } },
};

export {
    keyCodes,
}