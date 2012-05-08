// Skip. Not implemented.
// Only in browser.

class CustomBlockquote extends HTMLBlockquoteElement {
  constructor() {
    this.custom = 42;
  }
}

var customBlockquote = new CustomBlockquote;
assertEquals(42, customBlockquote.custom);
assertEquals('BLOCKQUOTE', customBlockquote.tagName);
assertTrue(customBlockquote instanceof CustomBlockquote);
assertTrue(customBlockquote instanceof HTMLBlockquoteElement);
assertTrue(customBlockquote instanceof HTMLQuoteElement);
assertTrue(customBlockquote instanceof HTMLElement);
