import { describe, it, expect } from 'vitest'
import { appendRef } from '@shna/shared/utilities/appendRef'

describe('appendRef', () => {
  it('[core] appends ref to plain URL', () => {
    expect(appendRef('https://example.com/path', 'email:news')).toBe(
      'https://example.com/path?ref=email:news',
    )
  })

  it('[core] preserves existing query params', () => {
    expect(appendRef('https://example.com/path?foo=1', 'email:news')).toBe(
      'https://example.com/path?foo=1&ref=email:news',
    )
  })

  it('[core] preserves fragments', () => {
    expect(appendRef('https://example.com/path#section', 'email:news')).toBe(
      'https://example.com/path?ref=email:news#section',
    )
  })

  it('[core] replaces existing ref', () => {
    expect(appendRef('https://example.com/path?ref=old&foo=1', 'email:new')).toBe(
      'https://example.com/path?ref=email:new&foo=1',
    )
  })
})
