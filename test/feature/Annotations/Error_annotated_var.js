// Should not compile.
// Options: --annotations
// SyntaxError: feature/Annotations/Error_annotated_var.js:9:1: Unsupported annotated expression
import {Anno} from './resources/setup';

@Anno
var test = 1;

