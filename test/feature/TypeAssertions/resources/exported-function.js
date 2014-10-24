import {assert} from './assert'
export function exportedParamAndReturn(a: number): number {
  return a === 0 ? 'invalid' : a;
}
