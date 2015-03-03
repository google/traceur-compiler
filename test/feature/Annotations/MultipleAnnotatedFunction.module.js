// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup.js';

@Anno
@Anno2('val')
function Multi() {}

assertArrayEquals([new Anno, new Anno2('val')], Multi.annotate);
