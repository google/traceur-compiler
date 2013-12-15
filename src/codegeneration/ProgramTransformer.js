// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {FromOptionsTransformer} from './FromOptionsTransformer';
import {ProjectTransformer} from './ProjectTransformer';

/**
 * Use FromOptionsTransformer to transforms Traceur Project or
 * SourceFile ParseTree to a JS ParseTree.
 * Use the get/set treeTransformer to append additional transforms.
 */
export class ProgramTransformer extends ProjectTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   */
  constructor(reporter, project) {
    var transformer = new FromOptionsTransformer(reporter,
                                                 project.identifierGenerator);
    super(reporter, project, transformer);
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @return {ObjectMap}
   */
  static transform(reporter, project) {
    var transformer = new ProgramTransformer(reporter, project);
    return transformer.transform();
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {SourceFile} sourceFile
   * @param {string} url
   * @return {ParseTree}
   */
  static transformFile(reporter, project, sourceFile) {
    var transformer = new ProgramTransformer(reporter, project);
    return transformer.transformFile(sourceFile);
  }
}
