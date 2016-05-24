RUNTIME_SRC = \
	src/runtime/runtime.js \
	src/runtime/url.js \
	src/loader/ModuleStoreImpl.js \
	# end files that must be script.

POLYFILL_SRC = \
	src/runtime/polyfills/Map.js \
	src/runtime/polyfills/Set.js \
	src/runtime/polyfills/Promise.js \
	src/runtime/polyfills/String.js \
	src/runtime/polyfills/Array.js \
	src/runtime/polyfills/Object.js \
	src/runtime/polyfills/Number.js \
	src/runtime/polyfills/Math.js \
	src/runtime/polyfills/WeakMap.js \
	src/runtime/polyfills/WeakSet.js \
	src/runtime/polyfills/polyfills.js

RUNTIME_MODULES = src/runtime/runtime-modules.js

INDIVIDUAL_RUNTIME_MODULES = \
	src/runtime/exportStar.js \
	src/runtime/properTailCalls.js \
	src/runtime/relativeRequire.js \
	src/runtime/spread.js \
	src/runtime/destructuring.js \
	src/runtime/classes.js \
	src/runtime/generators.js \
	src/runtime/async.js \
	src/runtime/spawn.js \
	src/runtime/template.js \
	src/runtime/jsx.js \
	#end runtime modules
SRC = \
	$(RUNTIME_MODULES) \
	$(POLYFILL_SRC) \
	src/traceur-import.js
TPL_GENSRC = \
	src/outputgeneration/regexpuRewritePattern.js \
	src/outputgeneration/SourceMapIntegration.js
GENSRC = \
	$(TPL_GENSRC) \
	src/codegeneration/ParseTreeTransformer.js \
	src/syntax/trees/ParseTreeType.js \
	src/syntax/trees/ParseTrees.js \
	src/syntax/ParseTreeVisitor.js

PREV_NODE = $(wildcard node_modules/traceur/src/node/*.js)
SRC_NODE = $(wildcard src/node/*.js)

SRC_ALL = $(shell find src/ -type f -name "*.js")
RUNTIME_SCRIPTS = $(foreach src, $(RUNTIME_SRC), --script $(src))

TFLAGS = --symbols=false --

UNIT_TESTS = \
	test/unit/util/ \
	test/unit/node/ \
	test/unit/syntax/ \
	test/unit/codegeneration/ \
	test/unit/semantics/ \
	test/unit/ \
	test/unit/runtime \
	#END UNIT_TESTS

FEATURE_TESTS = \
	test/feature/*/*.js

TESTS = \
	test/node-commonjs-test.js \
	test/node-amd-test.js \
	test/node-closure-test.js \
	test/node-instantiate-test.js \
	test/node-api-test.js \
	# End Node tests.

MOCHA_OPTIONS = \
	--ignore-leaks --ui tdd --reporter dot

ifdef ONLY
	MOCHA_OPTIONS := $(MOCHA_OPTIONS) --grep $(ONLY)
endif

GIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD)

PACKAGE_VERSION=$(shell node build/versionInfo.js -v)

build: bin/traceur.js wiki

min: bin/traceur.min.js

# Uses uglifyjs to compress. Make sure you have it installed
#	 npm install uglify-js -g
ugly: bin/traceur.ugly.js

test-runtime: bin/traceur-runtime.js $(RUNTIME_TESTS)
	@echo 'Open test/runtime.html to test runtime only'

test: bin/traceur.js \
		bin/BrowserSystem.js \
		test/unit \
		test/unit/runtime/traceur-runtime \
		wiki \
		test/amd-compiled \
		test/commonjs-compiled \
		test-interpret \
		test-interpret-absolute \
		test-inline-module-error \
		test-version \
		test/features \
		test/module-compiled \
		test-experimental
	node_modules/.bin/mocha $(MOCHA_OPTIONS) $(TESTS)
	$(MAKE) test-interpret-throw

test/unit: bin/traceur.js bin/traceur-runtime.js $(UNIT_TESTS)
	./tval test/runUnitTests.js

test/features: bin/traceur.js bin/traceur-runtime.js $(FEATURE_TESTS)
	./tval test/runFeatureTests.js

test/%-run: test/% bin/traceur.js
	node_modules/.bin/mocha $(MOCHA_OPTIONS) $<

test/module-compiled: bin/traceur.js
	node_modules/.bin/mocha $(MOCHA_OPTIONS) \
		--compilers js:test/register-cjs-test-wrapper.js --reporter dot test/feature/**/

test/commonjs: test/commonjs-compiled
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-commonjs-test.js

test/amd: test/amd-compiled
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-amd-test.js

test/closure:
	node_modules/.bin/mocha $(MOCHA_OPTIONS) test/node-closure-test.js

test-interpret: test/unit/node/traceur-interpreter.js
	./traceur $^

test-interpret-throw: test/unit/runtime/resources/throwsError.js
	./traceur $^ 2>&1 | grep 'ModuleEvaluationError' | wc -l | grep '1'

test-interpret-absolute: $(CURDIR)/test/unit/node/traceur-interpreter.js
	./traceur $^

test-inline-module-error:
	./traceur --out not-written.js \
		test/feature/Modules/Error_ImportDefault.js 2>&1 | sed '1d' > /dev/null

test/commonjs-compiled: force
	rm -f -r test.commonjs-compiled/*
	node src/node/to-commonjs-compiler.js test/commonjs test/commonjs-compiled

test/amd-compiled: force
	rm -f -r test/amd-compiled/*
	node src/node/to-amd-compiler.js test/amd test/amd-compiled

test/unit/runtime/traceur-runtime: \
	test/unit/runtime/resources/traceur-runtime.js bin/traceur-runtime.js
	node $<

test-version:
	./traceur -v | grep '[0-9]*\.[0-9]*\.[0-9]*'

# Skip sloppy tests because the Promise polyfill is defined in a module
# and module context in ES6 is strict by default
test-promise:
	node_modules/promises-aplus-tests/lib/cli.js \
	test/node-promise-adapter.js --grep "2.2.5" --grep "sloppy" --invert

test-compat-table: node_modules/es5-compat-table/data-es6.js bin/traceur.js
	npm install git+https://github.com/kangax/compat-table.git#gh-pages
	./traceur --source-maps='memory' test/verify-compat.js

test-experimental: bin/traceur.js
	./traceur --experimental -- ./test/unit/node/resources/let-x.js

boot: clean build

clean: wikiclean
	@rm -f build/compiled-by-previous-traceur.js
	@rm -f src/loader/version.js
	@rm -rf build/currentSemVer.mk
	@rm -f build/es6-no-modules/*
	@rm -f $(GENSRC)
	@rm -f $(COMPILE_BEFORE_TEST)
	@rm -f test/test-list.js
	@rm -rf test/commonjs-compiled/*
	@rm -rf test/commonjs-compiled-maps/*
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

# Do not change the location of this file if at all possible, see
# https://github.com/google/traceur-compiler/issues/828
bin/traceur-runtime.js: $(RUNTIME_SRC) $(RUNTIME_MODULES) $(POLYFILL_SRC) bin/traceur.js
	./traceur --out $@ --referrer='traceur-runtime@$(PACKAGE_VERSION)/bin/' \
		$(RUNTIME_SCRIPTS) $(TFLAGS) $(RUNTIME_MODULES) $(POLYFILL_SRC)

bin/traceur-bare.js: src/traceur-import.js build/compiled-by-previous-traceur.js
	./traceur --out $@ $(TFLAGS) $<

concat: bin/traceur-runtime.js bin/traceur-bare.js
	cat $^ > bin/traceur.js

bin/traceur.js: build/compiled-by-previous-traceur.js $(SRC_NODE)
	@cp $< $@; touch -t 197001010000.00 bin/traceur.js
	./traceur --source-maps=file --out bin/traceur.js --referrer='traceur@$(PACKAGE_VERSION)/bin/' \
		$(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

# Use last-known-good compiler to compile current source
build/compiled-by-previous-traceur.js: src/loader/version.js \
		$(PREV_NODE) \
		$(SRC) \
		node_modules/traceur/bin/traceur.js $(SRC_ALL) $(GENSRC) node_modules
	@mkdir -p bin/
	node_modules/traceur/traceur --out $@ --referrer='traceur@0.0.0/build/' \
		$(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

debug: build/compiled-by-previous-traceur.js $(SRC)
	./traceur --debug --out bin/traceur.js --sourcemap $(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC)

# Stand-alone browser support, incl. runtime, polyfills, compiler, and System
bin/BrowserSystem.js: src/browser/System.js src/WebPageTranscoder.js $(SRC_ALL)
	node_modules/traceur/traceur --source-maps=file --out $@ --referrer='traceur@$(PACKAGE_VERSION)/bin/' \
	$(RUNTIME_SCRIPTS) $(TFLAGS) $(SRC) src/browser/System.js

#
# Rules to test traceur.js compiled through path that first compiles out modules then es6.
# The regular compiler must be built before running these rules.
#

build/es6-no-modules/compiler.js: $(SRC_NODE) src/traceur-import.js
	node_modules/traceur/traceur --out $@ --modules=inline	--referrer='traceur@0.0.0/build/es6-no-modules/' \
		--outputLanguage=es6 $(TFLAGS) src/traceur-import.js

build/es6-no-modules/global-imports.js: $(RUNTIME_MODULES) $(POLYFILL_SRC) src/runtime/runtime-modules.js src/runtime/polyfills-imports.js
	./traceur --out build/es6-no-modules/global-imports.js --modules=inline --outputLanguage=es6 -- src/runtime/global-imports.js

build/es6-no-modules/runtime.js: $(RUNTIME_SRC) build/es6-no-modules/global-imports.js
	./traceur --out $@ $(RUNTIME_SCRIPTS) $(TFLAGS)
	cat build/es6-no-modules/global-imports.js >> $@

# The complete traceur compiler in es6 but with modules compiled away.
bin/traceur-es6-no-modules.js: build/es6-no-modules/runtime.js build/es6-no-modules/compiler.js
	cat $^ > $@

bin/traceur-from-no-modules.js: bin/traceur-es6-no-modules.js
	./traceur --out $@ --referrer='traceur@$(PACKAGE_VERSION)/bin/' --script bin/traceur-es6-no-modules.js $(TFLAGS)

test-no-modules: bin/traceur-from-no-modules.js bin/traceur-runtime.js bin/traceur.js
	cp bin/traceur.js bin/gold-traceur.js	# bin/traceur.js is called by test rules, so temp override it.
	cp bin/traceur-from-no-modules.js bin/traceur.js
	touch bin/traceur-runtime.js # our temp bin/traceur.js has a new timestamp, don't trigger rebuild.
	-$(MAKE) -r test
	cp -p bin/gold-traceur.js bin/traceur.js # preserve timestamp to avoid make triggers.
	rm bin/gold-traceur.js

#
#

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

src/loader/version.js: package.json build/versionInfo.js
	node ./build/versionInfo.js -m > $@

unicode-tables: \
	build/build-unicode-tables.js
	node $^ > src/syntax/unicode-tables.js

%.js: %.js-template
	node build/expand-js-template.js $< $@

# set NO_PREPUBLISH=1 to prevent endless loop of makes and npm installs.
NPM_INSTALL = NO_PREPUBLISH=1 npm install --local && touch node_modules

node_modules/%:
	$(NPM_INSTALL)

node_modules: package.json
	$(NPM_INSTALL)

bin/traceur.ugly.js: bin/traceur.js
	uglifyjs bin/traceur.js --compress -m -o $@

updateSemver: # unless the package.json has been manually edited.
	node build/versionInfo.js -v > build/npm-version-number
	git diff --quiet -- package.json && node build/incrementSemver.js

dist/commonjs: bin/traceur.js
	./traceur --dir src/ dist/commonjs/ --modules=commonjs --import-runtime \
		--symbols=false

prepublish: bin/traceur.js bin/traceur-runtime.js dist/commonjs/

WIKI_OUT = \
	test/wiki/CompilingOffline/out/greeter.js

wiki: $(WIKI_OUT)

wikiclean:
	@rm -rf test/wiki/CompilingOffline/out

test/wiki/CompilingOffline/out/greeter.js: test/wiki/CompilingOffline/greeter.js
	./traceur --out $@ $^


.PHONY: build min test test-list force boot clean distclean unicode-tables prepublish dist/commonjs

.SUFFIXES:
