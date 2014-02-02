import {assert} from './assert'
export function exportedParamAndReturn(a:Number):Number {
  return a === 0 ? 'invalid' : a;
}
