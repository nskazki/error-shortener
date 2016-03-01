'use strict'

import { sep } from 'path'
import SmartError from '../src/smart-error'
import assert = require('power-assert')

const cwd = process.cwd()

describe('SmartError', () => {
  it('just Error (classic-error)', () => {
    const jerr = new Error('hi im error :)')
    const sErr = new SmartError(jerr)

    // short
    assert(sErr.toShortString().indexOf(jerr.toString()) === 0)
    assert(sErr.toShortString().indexOf(cwd) === -1)
    assert(sErr.toShortString().split('\n').length === 2)

    // long
    assert(sErr.toLongString() === jerr.stack)
  })

  it('object with empty stack (empty-stack)', () => {
    const jerr = { message: 'hi im error :)' }
    const sErr = new SmartError(jerr)

    assert(sErr.toLongString() === 'Error: hi im error :)')
    assert(sErr.toShortString() === 'Error: hi im error :)')
  })

  it('object with different stack-name and name (classic-error)', () => {
    const jerr = {
      name: 'DiffError',
      message: 'hi im error :)',
      stack:
`MyError: hi im error :)
 at ${cwd}${sep}some
 at ${cwd}${sep}other`
    }

    const sErr = new SmartError(jerr)

    assert.equal(sErr.toLongString(),
`DiffError: hi im error :)
    at ${cwd}${sep}some
    at ${cwd}${sep}other`)
    assert.equal(sErr.toShortString(),
`DiffError: hi im error :)
    at some
    at other`)
  })

  it('object with different stack-message and message (classic-error)', () => {
    const jerr = {
      message: 'hi im diff error :)',
      stack:
`SomeError: hi im
  some
  multiline error :)
 at ${cwd}${sep}some
 at ${cwd}${sep}other`
    }

    const sErr = new SmartError(jerr)

    assert.equal(sErr.toLongString(),
`SomeError: hi im diff error :)
    at ${cwd}${sep}some
    at ${cwd}${sep}other`)
    assert.equal(sErr.toShortString(),
`SomeError: hi im diff error :)
    at some
    at other`)
  })

  it('object with multiline stack (without-stack-message)', () => {
    const jerr = {
      message: 'hi im error :)',
      stack:
` at ${cwd}${sep}some
  at ${cwd}${sep}other`
    }

    const expected =
`Error: hi im error :)
Stack:
    at ${cwd}${sep}some
    at ${cwd}${sep}other`

    const sErr = new SmartError(jerr)
    assert.equal(sErr.toLongString(), expected)
    assert.equal(sErr.toShortString(), expected)
  })

  it('object with multiline stack (classic-error) ', () => {
    const jerr = {
      message: 'hi im error :)',
      stack:
`Error: hi im error :)
 at ${cwd}${sep}some
 at ${cwd}${sep}other`
    }
    const sErr = new SmartError(jerr)

    assert.equal(sErr.toLongString(),
`Error: hi im error :)
    at ${cwd}${sep}some
    at ${cwd}${sep}other`)
    assert.equal(sErr.toShortString(),
`Error: hi im error :)
    at some
    at other`)
  })

  it('object with chrome stack (without-cwd)', () => {
    const jerr = {
      message: '',
      stack:
`Error
    at <anonymous>:2:13
    at Object.InjectedScript._evaluateOn (<anonymous>:875:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:808:34)
    at Object.InjectedScript.evaluate (<anonymous>:664:21)`
    }

    const expected =
`Error
Stack:
    at <anonymous>:2:13
    at Object.InjectedScript._evaluateOn (<anonymous>:875:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:808:34)
    at Object.InjectedScript.evaluate (<anonymous>:664:21)`

    const sErr = new SmartError(jerr)
    assert.equal(sErr.toLongString(), expected)
    assert.equal(sErr.toShortString(), expected)
  })

  it('object with phantom stack (without-stack-stack)', () => {
    const jerr = {
      message: 'JSON.stringify cannot serialize cyclic structures.',
      stack:
`stringify@[native code]
wrapper

global code
evaluateJavaScript@[native code]
evaluate
file:///home/nskazki/node.js/work-projects/dmca-ip-search-service/phantom-farm/worker/node_modules/node-phantom-simple/bridge.js:121:61`
    }

    const expected =
`Error: JSON.stringify cannot serialize cyclic structures.
Stack:
    stringify@[native code]
    wrapper
    global code
    evaluateJavaScript@[native code]
    evaluate
    file:///home/nskazki/node.js/work-projects/dmca-ip-search-service/phantom-farm/worker/node_modules/node-phantom-simple/bridge.js:121:61`

    const sErr = new SmartError(jerr)
    assert.equal(sErr.toLongString(), expected)
    assert.equal(sErr.toShortString(), expected)
  })

  it('object with bluebird longstack (classic-error)', () => {
    const jerr = {
      message:
`345!
some meta = 678
other avz = 012`,
      stack:
`Error: 345!!!!
SUCH DIFFERENT!
some meta = 678
other avz = 012
    at error (${cwd}/index.js:12:28)
From previous event:
    at error (${cwd}/index.js:12:27)
    at ${cwd}/index.js:19:15
    at Timer.listOnTimeout (timers.js:92:15)
    at node.js:933:3`
    }

    const sErr = new SmartError(jerr)
    assert.equal(sErr.toLongString(),
`Error: 345!
some meta = 678
other avz = 012
    at error (${cwd}/index.js:12:28)
From previous event:
    at error (${cwd}/index.js:12:27)
    at ${cwd}/index.js:19:15
    at Timer.listOnTimeout (timers.js:92:15)
    at node.js:933:3`)
    assert.equal(sErr.toShortString(),
`Error: 345!
some meta = 678
other avz = 012
    at error (index.js:12:28)
From previous event:
    at error (index.js:12:27)
    at index.js:19:15`)
  })
})
