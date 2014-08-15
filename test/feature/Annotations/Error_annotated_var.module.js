// Should not compile.
// Options: --annotations
// Error: :9:1: Unsupported annotated expression
import {Anno} from './resources/setup';

@Anno
var test = 1;

