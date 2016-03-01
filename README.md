# error-shortener

[![Build Status](https://travis-ci.org/nskazki/error-shortener.svg)](https://travis-ci.org/nskazki/error-shortener)
[![Coverage Status](https://coveralls.io/repos/github/nskazki/error-shortener/badge.svg?branch=master)](https://coveralls.io/github/nskazki/error-shortener)

>This module is written on `typescript`, and contains the `.d.ts` file.
><br>If you write on `typescript`: just use it in your project and definitions will be automatically uploaded.

```
npm i -S error-shortener
```

# Motivation

Once I tired of reading the error-stack on several screens.
So I wrote the module to clean the stack: it removes the elements that are out of your repository (based on `process.cwd()`), and the elements from the `node_modules` folder.
<br>Note: before cleaning the error will be checked to the expected format. If it is different, the stack cleaning  will not be fulfilled.

# API
```js
const API = require('error-shortner')

// performs reduction of the stack, normalized error-stack indents, replacement message and name to the actual
// alias to API.fmtShortError
API.fmtError(arg: API.IErrorLike): string
// normalized error-stack indents, replacement message and name to the actual
API.fmtLongErrorf(arg: API.IErrorLike): string
// compliance argument with the interface
API.isIErrorLike(arg: any): arg is API.IErrorLike
```

# Examples

# Example: error has an expected format

when formatting:
 * Replaced the old `SomeError` to the new `NewError` name.
 * Replaced the old message to new.
 * Excluded calls that do not relate to your source code.
 * Removed `process.cwd()` part of the file paths.

```js
import { fmtError } from 'error-shortener'

const likeBluebirdError = {
    name:    `NewError`,
    message: `Text added from some place!\
              \n\t SomeMeta: foo=bar; other=abc\
              \n\t OriginalError: something happened!`,
    stack:   `SomeError: something happened!
                  at error (/home/nskazki/node.js/example/index.js:12:28)
              From previous event:
                  at error (/home/nskazki/node.js/example/index.js:12:27)
                  at /home/nskazki/node.js/example/index.js:19:15
                  at Timer.listOnTimeout (timers.js:92:15)
              From previous event:
                  at Object.<anonymous> (/home/nskazki/node.js/example/index.js:19:4)
                  at Module._compile (module.js:413:34)
                  at Object.Module._extensions..js (module.js:422:10)
                  at Module.load (module.js:357:32)
                  at Function.Module._load (module.js:314:12)
                  at Function.Module.runMain (module.js:447:10)
                  at startup (node.js:141:18)
                  at node.js:933:3`
    }

console.error(fmtError(likeBluebirdError))
/*
NewError: Text added from some place!
       SomeMeta: foo=bar; other=abc
       OriginalError: something happened!
    at error (index.js:12:28)
From previous event:
    at error (index.js:12:27)
    at index.js:19:15`
From previous event:
    at Object.<anonymous> (index.js:19:4)
*/
```

# Example: unknown error format

when formatting:
  * added default `Error` name
  * normalized error-stack indents

```js
import { fmtError } from 'error-shortener'

const likePhantomError = {
    message: 'JSON.stringify cannot serialize cyclic structures.',
    stack:   `stringify@[native code]
              wrapper

              global code
              evaluateJavaScript@[native code]
              evaluate
              file:///home/nskazki/node.js/work-projects/dmca-ip-search-service/phantom-farm/worker/node_modules/node-phantom-simple/bridge.js:121:61`
  }

console.error(fmtError(likePhantomError))

/*
Error: JSON.stringify cannot serialize cyclic structures.
Stack:
    stringify@[native code]
    wrapper
    global code
    evaluateJavaScript@[native code]
    evaluate
    file:///home/nskazki/node.js/work-projects/dmca-ip-search-service/phantom-farm/worker/node_modules/node-phantom-simple/bridge.js:121:61`
*/
```

# Related

 * [pretty-error](https://github.com/AriaMinaei/pretty-error)
