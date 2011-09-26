trait Trait {}

function deriveFromTrait() {
  class ClassDerivingFromTrait extends Trait {}
}

// ----------------------------------------------------------------------------

assertThrows(deriveFromTrait);
