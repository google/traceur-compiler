// Copyright 2015 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const generator = Symbol();
const onDone = Symbol();

class DecoratedGenerator {
  constructor(_generator, _onDone) {
    this[generator] = _generator;
    this[onDone] = _onDone;
  }

  next(value) {
    var result = this[generator].next(value);
    if (result !== undefined && result.done) {
      this[onDone].call(this);
    }
    return result;
  }

  throw(error) {
    this[onDone].call(this);
    return this[generator].throw(error);
  }

  return(value) {
    this[onDone].call(this);
    return this[generator].return(value);
  }
}

export default class Observable {
  constructor(observe) {
    this[Symbol.observer] = observe;
  }

  static fromEvent(element, type) {
    return new Observable(function (generator) {
      var decoratedGenerator = new DecoratedGenerator(generator,
          () => element.removeEventListener(type, handler));

      var handler = event => decoratedGenerator.next(event);

      element.addEventListener(type, handler);

      return decoratedGenerator;
    });
  }
}

