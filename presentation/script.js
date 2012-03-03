var AFTERIMAGE_COUNT = 3;

var curSlide;
var animateStep;
var iconEl;
var presentationEl;
var slideEls;
var iconAnimateStep;

function advanceIcon() {
  iconEl.classList.add('animate');
  iconEl.classList.remove('animate-1');
  iconEl.classList.remove('animate-2');
  iconEl.classList.remove('animate-3');
  iconEl.classList.add('animate-' + iconAnimateStep);

  iconAnimateStep++;
  if (iconAnimateStep == 4) {
    iconAnimateStep = 1;
  }
}

function updateSlideHash() {
  var hash = (curSlide + 1);

  if (!presentationEl.classList.contains('with-notes')) {
    hash += '-no-notes';
  }
  window.location.replace('#' + hash);
}

function getSlideFromHash() {
  var hash = location.hash.substr(1);

  if (hash.indexOf('-no-notes') != -1) {
    hash = hash.replace(/-no-notes/, '');
    toggleNotes();
  }

  var number = parseInt(hash);

  if (number) {
    curSlide = number - 1;
  } else {
    curSlide = 0;
  }

}

function prevSlide() {
  if (curSlide == 0) {
    return null;
  }

  if (slideEls[curSlide + 1]) {
    slideEls[curSlide + 1].classList.remove('next');
    slideEls[curSlide + 1].classList.add('invisible');
  }

  slideEls[curSlide].classList.remove('current');
  slideEls[curSlide].classList.add('next');

  if (slideEls[curSlide - 1]) {
    slideEls[curSlide - 1].classList.remove('previous');
    slideEls[curSlide - 1].classList.add('current');
  }

  if (slideEls[curSlide - 2]) {
    slideEls[curSlide - 2].classList.remove('invisible');
    slideEls[curSlide - 2].classList.add('previous');
  }

  curSlide--;

  updateSlideHash();

  return slideEls[curSlide];
}

function createAfterimageElements() {
  if (slideEls[curSlide].afterimageEls && slideEls[curSlide].afterimageEls.length) {
    return;
  }

  slideEls[curSlide].afterimageEls = [];

  for (var i = 0; i < AFTERIMAGE_COUNT; i++) {
    var el = document.createElement('div');
    el.classList.add('slide');
    el.classList.add('afterimage');
    el.classList.add('dormant');
    el.classList.add('afterimage' + (i + 1));
    el.innerHTML = slideEls[curSlide].innerHTML;
    presentationEl.appendChild(el);

    slideEls[curSlide].afterimageEls.push(el);
  }
}

function nextSlide() {
  if (curSlide == slideEls.length - 1) {
    return null;
  }

  advanceIcon();

  if (slideEls[curSlide - 1]) {
    slideEls[curSlide - 1].classList.remove('previous');
    slideEls[curSlide - 1].classList.add('invisible');
  }

  slideEls[curSlide].classList.remove('current');
  slideEls[curSlide].classList.add('previous');

  if (slideEls[curSlide + 1]) {
    slideEls[curSlide + 1].classList.remove('next');
    slideEls[curSlide + 1].classList.add('current');
  }

  if (slideEls[curSlide + 2]) {
    slideEls[curSlide + 2].classList.remove('invisible');
    slideEls[curSlide + 2].classList.add('next');
  }

  /* Afterimage */

  if (!slideEls[curSlide].afterImageEls) {
    createAfterimageElements();
  }

  window.setTimeout(function() { playAfterimages(curSlide); }, 0);

  curSlide++;

  window.setTimeout(function() { createAfterimageElements(curSlide); }, 1000);

  updateSlideHash();

  return slideEls[curSlide];
}

function next() {
  // Figures out if there are more parts to this slide or if it should
  // advance using nextSlide.

  var currentSlideEl = slideEls[curSlide];
  if (!currentSlideEl.parts || !currentSlideEl.parts.next()) {
    var slide = nextSlide();
    //Tell the slide that we've come in from the previous slide.
    if (slide && slide.parts) {
      slide.parts.comingFromPrev();
    }
  }
}

function prev() {
  // Figures out if there are more parts to this slide or if it should
  // advance using prevSlide.

  var currentSlideEl = slideEls[curSlide];
  if (!currentSlideEl.parts || !currentSlideEl.parts.prev()) {
    var slide = prevSlide();
    //Tell the slide that we've come in from the next slide.
    if (slide && slide.parts) {
      slide.parts.comingFromNext();
    }
  }
}

function playAfterimages(slideNo) {
  var elList = slideEls[slideNo - 1].afterimageEls;

  for (var i in elList) {
    elList[i].classList.remove('dormant');
  }

  window.setTimeout(function() { playAfterimagesPart2(slideNo, elList); }, 0);
}

function playAfterimagesPart2(slideNo) {
  var slideEl = slideEls[slideNo - 1];

  if (!slideEl) {
    return;
  }
  var elList = slideEl.afterimageEls;

  for (var i in elList) {
    elList[i].classList.add('play');
  }

  window.setTimeout(function() { removeAfterimages(slideEl, elList); }, 2500);
}

function removeAfterimages(slideEl, elList) {
  for (var i in elList) {
    if (elList[i].parentNode) {
      elList[i].parentNode.removeChild(elList[i]);
    }
  }

  slideEl.afterimageEls = [];
}

function toggleNotes() {
  advanceIcon();

  presentationEl.classList.toggle('with-notes');

  updateSlideHash();
}

function handleBodyKeyDown(event) {
  switch (event.keyCode) {
    case 13: // Enter
    case 32: // space
    case 39: // right arrow
    case 40: // down arrow
      next();
      event.preventDefault();
      break;
    case 38: // up arrow
    case 37: // left arrow
      prev();
      event.preventDefault();
      break;
    case 78:
      toggleNotes();
      break;
    case 70: // F
      document.body.webkitRequestFullScreen();
      break;
  }
}

class SlideParts {

  new(slideEl) {
    this.slideEl = slideEl;
    this.currentPartIndex = -1;

   // Array's length is the number of eles. A true at any index means it's a
    // content part (not just notes).
    this.partDetails = [];
    this.init();
  }

  function init() {
    // Set up partDetails.

    // TODO: figure out which ones of these should not be active when notes are
    // collapsed. (Because it's possible to have a notes part without a
    // corresponding content part.)

    // Iterate through everything with a data-part attribute, swap in the right
    // class names for it, and take note of the highest partNum we see.

    var highestSeenPartNum = 0;

    var partEls = this.slideEl.querySelectorAll("[data-part]");
    var partNums, i, j;
    for (i = 0; i < partEls.length; i++) {
      partNums = partEls[i].getAttribute('data-part').split(",").map(function(num) { return parseInt(num, 10)});
      for (j = 0; j < partNums.length; j++) {
        partEls[i].classList.add("part-" + partNums[j]);
        if (partNums[j] > highestSeenPartNum) {
          highestSeenPartNum = partNums[j];
        }
      }
    }

    this.partDetails = new Array(highestSeenPartNum + 1);

    // Okay, now go through and see which of these parts actually have a CONTENT
    // component. Yeah, walking through this a second time is not the best way
    // to do this.
    partEls = this.slideEl.querySelectorAll('.content [data-part]');
    for (i = 0; i < partEls.length; i++) {
      partNums = partEls[i].getAttribute("data-part").split(",").map(function(num) { return parseInt(num, 10)});
      for (j = 0; j < partNums.length; j++) {
        this.partDetails[partNums[j]] = true;
      }
    }

    // The first part of a slide (which every slide has, even ones with no
    // explicit parts) is always content-driven. If we don't set it like this
    // then when notes are closed on slides without parts, we get in an infinite
    // cycle.
    this.partDetails[0] = true;

    this.slideEl.setAttribute("data-numparts", this.partDetails.length);
  }

  function _currentPartIndexChanged() {
    this.slideEl.setAttribute('data-currentpart', this.currentPartIndex);
    /* Working around a known webkit-bug where CSS doesn't notice if only a
       data-attribute that has style repercussions changes */
    this.slideEl.classList.toggle('bug-12519');

  }

  function comingFromPrev() {
    this.currentPartIndex = 0;
    this._currentPartIndexChanged();
  }

  function comingFromNext() {
    //This used to differ from comingFromPrev, because we'd step backwards through builds.
    //Now when you step backwards you go to the beginning of the slide.
    this.currentPartIndex = 0;
    this._currentPartIndexChanged();
  }

  function next() {
    /* Returns true if it had another part to next to, false if we're out of
    parts and should move on to next slide. If notes aren't enabled, we'll
    search for the next part that isn't just notes. */
    var notesEnabled = presentationEl.classList.contains('with-notes');
    do {
      if (this.currentPartIndex == this.partDetails.length - 1) {
        return false;
      }
      this.currentPartIndex++;
      this._currentPartIndexChanged();
    } while(!notesEnabled && !this.partDetails[this.currentPartIndex])
    return true;
  }

  function prev() {
    /* Returns false if it had another part to prev to, false if we're out of
    parts and should move on to prev slide. If notes aren't enabled, we'll
    search for the next part that isn't just in the notes. */
    var notesEnabled = presentationEl.classList.contains('with-notes');
    do {
      if (this.currentPartIndex == 0) {
        return false;
      }
      this.currentPartIndex--;
      this._currentPartIndexChanged();
    } while(!notesEnabled && !this.partDetails[this.currentPartIndex])
    return true;
  }
}

function getElements() {
  presentationEl = document.querySelector('#presentation');
  slideEls = document.querySelectorAll('.slide');
  iconEl = document.querySelector('footer .icon');
}

function setUpSlides() {
  for (var i = 0, el; el = slideEls[i]; i++) {
    slideEls[i].classList.add('invisible');
    slideEls[i].parts = new SlideParts(slideEls[i]);
  }

  if (slideEls[curSlide - 1]) {
    slideEls[curSlide - 1].classList.remove('invisible');
    slideEls[curSlide - 1].classList.add('previous');
  }

  slideEls[curSlide].classList.remove('invisible');
  slideEls[curSlide].classList.add('current');
  if (slideEls[curSlide].parts) slideEls[curSlide].parts.comingFromPrev();

  if (slideEls[curSlide + 1]) {
    slideEls[curSlide + 1].classList.remove('invisible');
    slideEls[curSlide + 1].classList.add('next');
  }

  createAfterimageElements();
}

function initializeTraceurSlide() {
  var compiler = traceur;
  var input = document.getElementById('traceur');
  var output = document.getElementById('traceur_out');
  var teval = document.getElementById('traceur_eval');

  function handleTraceurInput() {
    output.value = '';

    var error;
    var reporter = new traceur.util.ErrorReporter();
    reporter.reportMessageInternal = function(location, kind, format, args) {
      if (location) {
        format = location + ': ' + format;
      }
      var e = format + '\n';
      error = error ? error + e : e;
    };

    var url = window.location.href;
    var project = new traceur.semantics.symbols.Project(url);
    var name = 'traceur';
    var contents = input.value;
    var sourceFile = new traceur.syntax.SourceFile(name, contents);
    project.addFile(sourceFile);
    var res = traceur.codegeneration.Compiler.compile(reporter, project, false);
    if (reporter.hadError()) {
      output.innerHTML = error;
    } else {
      var compiled = traceur.outputgeneration.ProjectWriter.write(res);
      output.innerHTML = classifyTraceurTokens(compiled);
    }
  }

  function handleTraceurKeyDown(event) {
    if (event.keyCode != 9) {
      event.stopPropagation();
    }
  }

  function handleTraceurEval(event) {
    ('global', eval)(output.innerText);
  }

  input.addEventListener('input', handleTraceurInput, false);
  input.addEventListener('keydown', handleTraceurKeyDown, false);
  teval.addEventListener('click', handleTraceurEval, false);
}


function addEventListeners() {
  document.body.addEventListener('keydown', handleBodyKeyDown, false);
}

function initialize() {
  iconAnimateStep = 1;

  getElements();

  getSlideFromHash();
  updateSlideHash();

  setUpSlides();

  addEventListeners();
  initializeTraceurSlide();
}

// needed for demo-ing traceur
function deferTimeout(ms) {
  var deferred = new Deferred();
  window.setTimeout(function() { deferred.callback(); }, ms);
  return deferred.createPromise();
}

