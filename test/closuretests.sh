#!/bin/bash
set -e # abort on errors

pushd $(dirname $0) > /dev/null

# compile all files into output
for i in `find ../third_party/closure-library -name \*.js`
do
    ../src/traceurc $i
done

# diff baseline with the output
diff -r -u closurebaseline/ out/

echo PASSED

popd > /dev/null
