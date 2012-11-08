build: bin/traceur.js

min: bin/traceur.min.js

test: build
	node test/testfeatures.js

force:
	build/build

boot: clean build

clean:
	git checkout bin
	touch -t 197001010000.00 bin/traceur.js

distclean: clean
	rm build/dep.mk

bin/traceur.min.js: bin/traceur.js
	node build/minifier.js $? $@

bin/traceur.js: build/dep.mk
	build/build

build/dep.mk:
	build/build --dep > $@

.PHONY: build min test force boot clean distclean

-include build/dep.mk
-include build/local.mk
