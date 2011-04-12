#!/bin/bash
set -e # abort on errors

pushd $(dirname $0) > /dev/null

# compile all files into output
find ../third_party/closure-library -name \*.js | xargs ../src/traceurc

# diff baseline with the output
diff -r closurebaseline/ out/

echo PASSED

popd > /dev/null
