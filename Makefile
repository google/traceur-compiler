build: bin/traceur.js

min: bin/traceur.min.js

test: build
	node test/testfeatures.js --errsfile test/errsfile.json

force:
	build/build

boot: clean build

clean:
	git checkout bin
	touch -t 197001010000.00 bin/traceur.js

distclean: clean
	rm build/dep.mk

initbench:
	rm -rf test/bench/esprima
	git clone https://github.com/ariya/esprima.git test/bench/esprima
	cd test/bench/esprima; \
			git reset --hard 1ddd7e0524d09475a14eee66e8e1e3557c5b5999
	git apply test/bench/esprima-compare.patch

bin/traceur.min.js: bin/traceur.js
	node build/minifier.js $? $@

bin/traceur.js: build/dep.mk src/syntax/trees/ParseTreeType.js src/syntax/trees/ParseTrees.js
	build/build

build/dep.mk:
	build/build --dep > $@

src/syntax/trees/ParseTrees.js: src/syntax/trees/trees.json build/build-parse-trees.js
	node build/build-parse-trees.js src/syntax/trees/trees.json > $@

src/syntax/trees/ParseTreeType.js: src/syntax/trees/trees.json build/build-parse-tree-type.js
	node build/build-parse-tree-type.js src/syntax/trees/trees.json > $@

.PHONY: build min test force boot clean distclean

-include build/dep.mk
-include build/local.mk
