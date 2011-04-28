var result;
{
  let let_result = [];
  let let_array = ['one', 'two', 'three'];
  for (var index = 1 in let_array) {
    let let_index = index;
    let let_value = let_array[let_index];
    let_result.push(
        function() {
          return [let_ott, let_index, let_value];
        });
  }
  result = let_result;
}

// ----------------------------------------------------------------------------
