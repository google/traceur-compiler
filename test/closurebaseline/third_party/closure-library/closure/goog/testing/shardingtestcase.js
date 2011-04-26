
goog.provide('goog.testing.ShardingTestCase'); 
goog.require('goog.asserts'); 
goog.require('goog.testing.TestCase'); 
goog.testing.ShardingTestCase = function(shardIndex, numShards, opt_name) { 
  goog.base(this, opt_name); 
  goog.asserts.assert(shardIndex > 0, 'Shard index should be positive'); 
  goog.asserts.assert(numShards > 0, 'Number of shards should be positive'); 
  goog.asserts.assert(shardIndex <= numShards, 'Shard index out of bounds'); 
  this.shardIndex_ = shardIndex; 
  this.numShards_ = numShards; 
}; 
goog.inherits(goog.testing.ShardingTestCase, goog.testing.TestCase); 
goog.testing.ShardingTestCase.prototype.sharded_ = false; 
goog.testing.ShardingTestCase.prototype.runTests = function() { 
  if(! this.sharded_) { 
    var numTests = this.getCount(); 
    goog.asserts.assert(numTests >= this.numShards_, 'Must have at least as many tests as shards!'); 
    var shardSize = Math.ceil(numTests / this.numShards_); 
    var startIndex =(this.shardIndex_ - 1) * shardSize; 
    var endIndex = startIndex + shardSize; 
    goog.asserts.assert(this.order == goog.testing.TestCase.Order.SORTED, 'Only SORTED order is allowed for sharded tests'); 
    this.setTests(this.getTests().slice(startIndex, endIndex)); 
    this.sharded_ = true; 
  } 
  goog.base(this, 'runTests'); 
}; 
goog.testing.ShardingTestCase.shardByFileName = function(opt_name) { 
  var path = window.location.pathname; 
  var shardMatch = path.match(/_(\d+)of(\d+)_test\.html/); 
  goog.asserts.assert(shardMatch, 'Filename must be of the form "foo_1of5_test.html"'); 
  var shardIndex = parseInt(shardMatch[1], 10); 
  var numShards = parseInt(shardMatch[2], 10); 
  var testCase = new goog.testing.ShardingTestCase(shardIndex, numShards, opt_name); 
  goog.testing.TestCase.initializeTestRunner(testCase); 
}; 
