import {create: Name, isName} from '@name';
import create from '@name';
module n from '@name'

var n1 = create();
var n2 = Name();
var n3 = new Name();

assertTrue(isName(n1));
assertTrue(isName(n2));
assertTrue(isName(n3));

assertEquals(Name, create);
assertEquals(n.create, create);
assertEquals(isName, isName);
