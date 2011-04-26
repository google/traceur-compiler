
goog.provide('goog.crypt.hash_test'); 
goog.require('goog.testing.asserts'); 
goog.setTestOnly('hash_test'); 
goog.crypt.hash_test.runBasicTests = function(hash) { 
  hash.update([97, 158]); 
  var golden = hash.digest(); 
  hash.reset(); 
  hash.update([97, 158]); 
  assertArrayEquals('The reset did not produce the initial state', golden, hash.digest()); 
  hash.reset(); 
  hash.update([158, 97]); 
  assertTrue('Swapping bytes resulted in a hash collision', ! ! goog.testing.asserts.findDifferences(golden, hash.digest())); 
  hash.reset(); 
  hash.update([97]); 
  hash.update([158]); 
  assertArrayEquals('Partial updates resulted in a different hash', golden, hash.digest()); 
  hash.reset(); 
  hash.update([97, 158], 0); 
  hash.update([97, 158, 32], 2); 
  assertArrayEquals('Updating with an explicit buffer length did not work', golden, hash.digest()); 
  hash.reset(); 
  var empty = hash.digest(); 
  assertTrue('Empty hash collided with a non-trivial one', ! ! goog.testing.asserts.findDifferences(golden, empty)); 
  hash.reset(); 
  hash.update([]); 
  assertArrayEquals('Updating with an empty buffer did not give an empty hash', empty, hash.digest()); 
}; 
