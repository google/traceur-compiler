SRC = \
  src/runtime/runtime.js \
  src/runtime/runtime-modules.js \
  src/traceur.js
TPL_GENSRC = \
  src/outputgeneration/SourceMapIntegration.js
GENSRC = \
  $(TPL_GENSRC) \
  src/codegeneration/ParseTreeTransformer.js \
  src/syntax/trees/ParseTreeType.js \
  src/syntax/trees/ParseTrees.js \
  src/syntax/ParseTreeVisitor.js
TPL_GENSRC_DEPS = $(addsuffix -template.js.dep, $(TPL_GENSRC))

TFLAGS = --

TESTS = \
	test/node-feature-test.js \
	test/unit/codegeneration/ \
	test/unit/syntax/ \
	test/unit/semantics/ \
	test/unit/util/ \
	test/unit/system/ \
	test/unit/runtime/modules.js

build: bin/traceur.js

min: bin/traceur.min.js

# Uses uglifyjs to compress. Make sure you have it installed
#   npm install uglify-js -g
ugly: bin/traceur.ugly.js

test: build test/test-list.js
	mocha --ignore-leaks --ui tdd --require test/unit/node-env.js $(TESTS)

test-list: test/test-list.js

test/test-list.js: build/build-test-list.js
	git ls-files test/feature | node $? > $@

boot: clean build

clean:
	git checkout bin
	touch -t 197001010000.00 bin/traceur.js

distclean: clean
	rm -f build/dep.mk
	rm -f $(GENSRC) $(TPL_GENSRC_DEPS)

initbench:
	rm -rf test/bench/esprima
	git clone https://github.com/ariya/esprima.git test/bench/esprima
	cd test/bench/esprima; git reset --hard 1ddd7e0524d09475
	git apply test/bench/esprima-compare.patch

bin/traceur.min.js: bin/traceur.js
	node build/minifier.js $? $@

bin/traceur.js force:
	./traceur --out bin/traceur.js $(TFLAGS) $(SRC)

# Prerequisites following '|' are rebuilt just like ordinary prerequisites.
# However, they don't cause remakes if they're newer than the target. See:
# http://www.gnu.org/software/make/manual/html_node/Prerequisite-Types.html
build/dep.mk: | $(GENSRC) node_modules
	node build/makedep.js --depTarget bin/traceur.js $(TFLAGS) $(SRC) > $@

$(TPL_GENSRC_DEPS): | node_modules

src/syntax/trees/ParseTrees.js: \
  build/build-parse-trees.js src/syntax/trees/trees.json
	node $^ > $@

src/syntax/trees/ParseTreeType.js: \
  build/build-parse-tree-type.js src/syntax/trees/trees.json
	node $^ > $@

src/syntax/ParseTreeVisitor.js: \
  build/build-parse-tree-visitor.js src/syntax/trees/trees.json
	node $^ > $@

src/codegeneration/ParseTreeTransformer.js: \
  build/build-parse-tree-transformer.js src/syntax/trees/trees.json
	node $^ > $@

%.js: %.js-template.js
	node build/expand-js-template.js --nolint=^node_modules $< $@

%.js-template.js.dep: | %.js-template.js
	node build/expand-js-template.js --deps $| > $@

NPM_INSTALL = npm install --local && touch node_modules

node_modules/%:
	$(NPM_INSTALL)

node_modules: package.json
	$(NPM_INSTALL)

bin/traceur.ugly.js: bin/traceur.js
	uglifyjs bin/traceur.js --compress -m -o $@

.PHONY: build min test test-list force boot clean distclean

-include build/dep.mk
-include $(TPL_GENSRC_DEPS)
-include build/local.mk
