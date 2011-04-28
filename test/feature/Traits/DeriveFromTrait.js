trait Trait {}

function deriveFromTrait() {
  class ClassDerivingFromTrait : Trait {}
}

// ----------------------------------------------------------------------------

assertThrows(deriveFromTrait);
