RUNTIME_SRC = \
  src/runtime/runtime.js \
  src/runtime/url.js \
  src/runtime/ModuleStore.js
SRC = \
  src/runtime/polyfill-import.js \
  src/traceur-import.js
TPL_GENSRC = \
  src/outputgeneration/SourceMapIntegration.js
GENSRC = \
  $(TPL_GENSRC) \
  src/codegeneration/ParseTreeTransformer.js \
  src/syntax/trees/ParseTreeType.js \
  src/syntax/trees/ParseTrees.js \
  src/syntax/ParseTreeVisitor.js
TPL_GENSRC_DEPS = $(addsuffix -template.js.dep, $(TPL_GENSRC))

PREV_NODE = $(wildcard node_modules/traceur/src/node/*.js)
SRC_NODE = $(wildcard src/node/*.js)

SRC_ALL = $(shell find src/ -type f -name "*.js")
RUNTIME_SCRIPTS = $(foreach src, $(RUNTIME_SRC), --script $(src))

TFLAGS = --

RUNTIME_TESTS = \
  test/unit/runtime/System.js \
  test/unit/runtime/Loader.js

UNIT_TESTS = \
	test/unit/codegeneration/ \
	test/unit/node/ \
	test/unit/semantics/ \
	test/unit/syntax/ \
	test/unit/system/ \
	test/unit/util/

TESTS = \
	test/node-commonjs-test.js \
	test/node-amd-test.js \
	test/node-feature-test.js \
	$(RUNTIME_TESTS) \
	$(UNIT_TESTS)

COMPILE_BEFORE_TEST = \
	test/unit/semantics/FreeVariableChecker.generated.js \
	test/unit/codegeneration/PlaceholderParser.generated.js

MOCHA_OPTIONS = \
	--ignore-leaks --ui tdd --require test/node-env.js

GIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD)

PACKAGE_VERSION=$(shell node build/printSemver.js)

build: bin/traceur.js wiki

min: bin/traceur.min.js

# Uses uglifyjs to compress. Make sure you have it installed
#   npm install uglify-js -g
ugly: bin/traceur.ugly.js

test-runtime: bin/traceur-runtime.js $(RUNTIME_TESTS)
	@echo 'Open test/runtime.html to test runtime only'

test: test/test-list.js bin/traceur.js $(COMPILE_BEFORE_TEST) \
	test/unit/runtime/traceur-runtime \
	wiki test/amd-compiled test/commonjs-compiled test-interpret \
	test-interpret-absolute test-inline-module-error
	node_modules/.bin/mocha $(MOCHA_OPTIONS) $(TESTS)

test/unit: bin/traceur.js bin/traceur-runtime.js
	node_modules/.bin/mocha $(MOCHA_OPTIONS) $(UNIT_TESTS)

test/unit/%-run: test/unit/% bin/traceur.js
	node_modules/.bin/mocha $(MOCHA_OPTIONS) $<

test/commonjs: test/commonjs-compiled
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-commonjs-test.js

test/amd: test/amd-compiled
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-amd-test.js

test/features: bin/traceur.js bin/traceur-runtime.js test/test-list.js
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-feature-test.js

test-list: test/test-list.js

test/test-list.js: force
	@git ls-files -o -c test/feature | node build/build-test-list.js > $@

test-interpret: test/unit/runtime/test_interpret.js
	./traceur $^

test-interpret-absolute: $(CURDIR)/test/unit/runtime/test_interpret.js
	./traceur $^

test-inline-module-error:
	./traceur --out not-written.js \
		test/feature/Modules/Error_ImportDefault.js  2>&1 | sed '1d'

# TODO(vojta): Trick make to only compile when necessary.
test/commonjs-compiled: force
	node src/node/to-commonjs-compiler.js test/commonjs test/commonjs-compiled

test/amd-compiled: force
	node src/node/to-amd-compiler.js test/amd test/amd-compiled

test/unit/%.generated.js: test/unit/es6/%.js
	./traceur --out $@ $(TFLAGS) $<

test/unit/runtime/traceur-runtime: \
	test/unit/runtime/traceur-runtime.js bin/traceur-runtime.js
	node $<

boot: clean build

clean: wikiclean
	@rm -f build/compiled-by-previous-traceur.js
	@rm -f build/previous-commit-traceur.js
	@rm -rf build/node
	@rm -rf build/currentSemVer.mk
	@rm -f $(GENSRC) $(TPL_GENSRC_DEPS)
	@rm -f $(COMPILE_BEFORE_TEST)
	@rm -f test/test-list.js
	@rm -rf test/commonjs-compiled/*
	@rm -rf test/amd-compiled/*
	@rm -f bin/*
	$(NPM_INSTALL)

initbench:
	rm -rf test/bench/esprima
	git clone https://github.com/ariya/esprima.git test/bench/esprima
	cd test/bench/esprima; git reset --hard 1ddd7e0524d09475
	git apply test/bench/esprima-compare.patch

bin/%.min.js: bin/%.js
	node build/minifier.js $^ $@

bin/traceur-runtime.js: $(RUNTIME_SRC) src/runtime/polyfill-import.js
	./traceur --out $@ --referrer='traceur-runtime@$(PACKAGE_VERSION)/' \
	  $(RUNTIME_SCRIPTS) $(TFLAGS) src/runtime/polyfill-import.js

bin/traceur-bare.js: src/traceur-import.js build/compiled-by-previous-traceur.js
	./traceur --out $@ $(TFLAGS) $<

concat: bin/traceur-runtime.js bin/traceur-bare.js
	cat $^ > bin/traceur.js

bin/traceur.js: build/compiled-by-previous-traceur.js $(SRC_NODE)
	@cp $< $@; touch -t 197001010000.00 bin/traceur.js
	./traceur --out bin/traceur.js --referrer='traceur@$(PACKAGE_VERSION)/' \
	  $(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

# Use last-known-good compiler to compile current source
build/compiled-by-previous-traceur.js: \
	  $(subst node_modules/traceur/src/node,build/node,$(PREV_NODE)) \
	  build/previous-commit-traceur.js $(SRC_ALL)  | $(GENSRC) node_modules
	@mkdir -p bin/
	@cp build/previous-commit-traceur.js bin/traceur.js
	./traceur-build --debug --out $@  --referrer='traceur@0.0.0/' \
	  $(RUNTIME_SCRIPTS) src/traceur-import $(TFLAGS)  $(SRC)

build/node/%: node_modules/traceur/src/node/%
	@mkdir -p build/node
	cp $< $@

build/previous-commit-traceur.js:
	cp node_modules/traceur/bin/traceur.js $@

debug: build/compiled-by-previous-traceur.js $(SRC)
	./traceur --debug --out bin/traceur.js --sourcemap $(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

self: build/previous-commit-traceur.js force
	./traceur-build --debug --out bin/traceur.js $(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

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

unicode-tables: \
	build/build-unicode-tables.js
	node $^ > src/syntax/unicode-tables.js

%.js: %.js-template.js
	node build/expand-js-template.js $< $@

%.js-template.js.dep: | %.js-template.js
	node build/expand-js-template.js --deps $| > $@

# set NO_PREPUBLISH=1 to prevent endless loop of makes and npm installs.
NPM_INSTALL = NO_PREPUBLISH=1 npm install --local && touch node_modules

node_modules/%:
	$(NPM_INSTALL)

node_modules: package.json
	$(NPM_INSTALL)

bin/traceur.ugly.js: bin/traceur.js
	uglifyjs bin/traceur.js --compress -m -o $@

updateSemver: # unless the package.json has been manually edited.
	git diff --quiet -- package.json && node build/incrementSemver.js

prepublish: bin/traceur.js bin/traceur-runtime.js

WIKI_OUT = \
  test/wiki/CompilingOffline/out/greeter.js

wiki: $(WIKI_OUT)

wikiclean:
	@rm -rf test/wiki/CompilingOffline/out

test/wiki/CompilingOffline/out/greeter.js: test/wiki/CompilingOffline/greeter.js
	./traceur --out $@ $^


.PHONY: build min test test-list force boot clean distclean unicode-tables prepublish

-include $(TPL_GENSRC_DEPS)
