function causeAnError() {
  throw new Error('dep error');
}

function seeAStack() {
  causeAnError();
}

seeAStack();