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


import {ObjectMap} from '../util/ObjectMap';
import {AttachUrlTransformer} from 'module/AttachUrlTransformer';
import {MODULE} from '../syntax/trees/ParseTreeType';

/**
 * Apply a ParseTreeTransformer to an entire Project
 */
export class ProjectTransformer {
  /**
   * @param {ParseTreeTransformer} transformer
   * @param {ErrorReporter} reporter
   * @param {Project} project
   */
  constructor(reporter, project, transformer = undefined) {
    this.project_ = project;
    this.reporter_ = reporter;
    this.treeTransformer = transformer;

    this.results_ = new ObjectMap();
  }

  /**
   * Apply the current treeTransformer to the project
   * @return {ObjectMap}
   * @private
   */
  transform() {
    this.project_.getSourceFiles().forEach((file) => {
      this.transformFile(file);
    });
    return this.results_;
  }

  /**
   * @param {SourceFile} file
   * @return {ParseTree}
   */
  transformFile(file) {
    var tree = AttachUrlTransformer.transformFile(file, this.project_);
    var result = this.treeTransformer.transform(tree);
    this.results_.set(file, result);
    return result
  }
}
