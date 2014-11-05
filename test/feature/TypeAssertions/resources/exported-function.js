import {assert} from './assert.js'
export function exportedParamAndReturn(a: number): number {
  return a === 0 ? 'invalid' : a;
}
