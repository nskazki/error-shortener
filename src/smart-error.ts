'use strict'

import {
  isString, isObject, isUndefined,
  pick, merge, first, last, chain } from 'lodash'
import { inspect } from 'util'
import { sep } from 'path'

export interface IErrorLike {
  message: string,
  stack?: string,
  name?: string
}

export interface IElement {
  line: string,
  index: number
}

export function isErrorLike(arg: any): arg is IErrorLike {
  return true
    && isObject(arg)
    && isString(arg.message)
    && (isUndefined(arg.stack) || isString(arg.stack))
    && (isUndefined(arg.name) || isString(arg.name))
}

export function fmtError(rawError: any): string {
  return fmtShortError(rawError)
}

export function fmtShortError(rawError: any): string {
  const sErr = new SmartError(rawError)
  return sErr.toShortString()
}

export function fmtLongError(rawError: any): string {
  const sErr = new SmartError(rawError)
  return sErr.toLongString()
}

export default class SmartError implements IErrorLike {
  message: string
  name:  string
  stack: string

  private _stackRE: RegExp = /^(\s+at\s)|(From previous event:$)|(-{10,}$)/
  private _frameRE: RegExp = /^(From previous event:$)|(-{10,}$)/
  private _errorNameRE: RegExp = /(\w+)(($)|(:.*$))/

  constructor(rawError: any) {
    if (!isErrorLike(rawError))
      throw new Error(`SmartError#new: first arg must be a IErrorLike!\
        \n\t arg type: ${typeof rawError}\
        \n\t arg data: ${inspect(rawError)}`)

    merge(this, { stack: '' }, pick(rawError, 'stack', 'message', 'name'))

    if (isUndefined(this.name) && this._isClassicError)
      this.name = first(this._messageElements).line.match(this._errorNameRE)[1]
    if (isUndefined(this.name))
      this.name = 'Error'
  }

  toString(): string {
    return this.toShortString()
  }

  valueOf(): string {
    return this.toShortString()
  }

  toShortString(): string {
    const isEmptyStack = this._shortStack.length === 0

    return isEmptyStack || this._isClassicError
      ? `${this._nameAndMessage}${this._shortStack}`
      : `${this._nameAndMessage}\nStack:${this._shortStack}`
  }

  toLongString(): string {
    const isEmptyStack = this._longStack.length === 0

    return isEmptyStack || this._isClassicError
      ? `${this._nameAndMessage}${this._longStack}`
      : `${this._nameAndMessage}\nStack:${this._longStack}`
  }

  private get _nameAndMessage(): string {
    return this.message.length !== 0
      ? `${this.name}: ${this.message}`
      : `${this.name}`
  }

  private get _shortStack(): string {
    if (!this._isClassicError)
      return this._longStack

    const cwd = process.cwd() + sep
    const fLine = (first(this._stackLines) || '').replace(cwd, '')
    const sLines = this._stackLines
      .slice(1)
      .filter(line => false
        || this._frameRE.test(line)
        || (true
          && (line.indexOf('node_modules') === -1)
          && (line.indexOf(cwd) !== -1)))
      .map(line => line.replace(cwd, ''))

    const aLines = [ fLine, ...sLines ]
    const isEmpty = aLines.every(line => line.length === 0)
    return !isEmpty
      ? '\n' + aLines.join('\n')
      : this._longStack
  }

  private get _longStack(): string {
    const lines = this._stackLines
    const isEmpty = lines.every(line => line.length === 0)
    return !isEmpty
      ? '\n' + lines.join('\n')
      : ''
  }

  private get _stackLines(): string[] {
    const resultLines = this._isClassicError
      ? this._stackElements.map(({ line }) => line)
      : this._rawStackLines
          .filter(line => this._nameAndMessage.indexOf(line) === -1)
          .filter(line => this.message.indexOf(line) === -1)
          .filter(line => line.indexOf(this.name) !== 0)

    return resultLines.map(line => this._frameRE.test(line)
      ? line.replace(/^\s*/, '')
      : line.replace(/^\s*/, '    '))
  }

  private get _isClassicError(): boolean {
    const lastMessageWrap = last(this._messageElements)
    const lastMessageLine = isObject(lastMessageWrap)
      ? lastMessageWrap.index
      : -1

    const firstStackWarp = first(this._stackElements)
    const firstStackLine = isObject(firstStackWarp)
      ? firstStackWarp.index
      : -1

    const firstLine = first(this._rawStackLines) || ''
    const isStackIncludeMessage  = this._errorNameRE.test(firstLine)

    const isStackInclideCWD = this._stackElements
      .some(({ line }) => line.indexOf(process.cwd()) !== -1)

    const mLength = this._messageElements.length
    const sLength = this._stackElements.length

    return true
      && ((mLength + sLength) === this._rawStackLines.length)
      && (lastMessageLine !== -1)
      && (firstStackLine !== -1)
      && (lastMessageLine < firstStackLine)
      && isStackIncludeMessage
      && isStackInclideCWD
  }

  private get _stackElements(): IElement[] {
    return chain(this._rawStackLines)
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => this._stackRE.test(line))
      .value()
  }

  private get _messageElements(): IElement[] {
    return chain(this._rawStackLines)
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => !this._stackRE.test(line))
      .value()
  }

  private get _rawStackLines(): string[] {
    return this.stack
      .split(/\n|\r/)
      .filter(line => line.length !== 0)
  }
}
