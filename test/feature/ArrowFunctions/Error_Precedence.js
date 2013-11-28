// Should not compile.
// Error: :4:26: Semi-colon expected

var identity = (x) => {x}.bind({});
