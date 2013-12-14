var o = {
  unicorns: 42,
  fairyGodmothers: 3
};

with (o) {
  x = 42;
  y = x * x;

  bubbles = 1000;
  fairyGodmotherBubbles = bubbles * fairyGodmothers;
  unicorns = bubbles * fairyGodmothers - (fairyGodmotherBubbles - unicorns);
}
