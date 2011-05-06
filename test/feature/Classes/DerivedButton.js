// Only in browser.

class CustomButton : HTMLButtonElement {
  new() {
    this.value = 'Custom Button';
  }
}

class CustomSelect : HTMLSelectElement {}
class CustomInput : HTMLInputElement {}
class CustomDiv : HTMLDivElement {}
class CustomUIEvent : UIEvent {}
// class CustomSpan : HTMLSpanElement {}
class CustomTableRow : HTMLTableRowElement {}
class CustomHeading : HTMLHeadingElement {}
class CustomElement : HTMLElement {}
class CustomUList : HTMLUListElement {}
class CustomLI : HTMLLIElement {}
class CustomMenu : HTMLMenuElement {}
class CustomTextArea : HTMLTextAreaElement {}

// ----------------------------------------------------------------------------

var button = new CustomButton();
document.body.appendChild(button);
document.body.appendChild(new CustomSelect());
document.body.appendChild(new CustomInput());
document.body.appendChild(new CustomDiv());
// document.body.appendChild(new CustomSpan());
document.body.appendChild(new CustomTableRow());
document.body.appendChild(new CustomHeading());
document.body.appendChild(new CustomElement());
document.body.appendChild(new CustomUList());
document.body.appendChild(new CustomLI());
document.body.appendChild(new CustomMenu());
document.body.appendChild(new CustomTextArea());

// TODO(rnystrom): Test these.
