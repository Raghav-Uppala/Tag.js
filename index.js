class tagJS {
  modifiers;
  inputDiv;
  modifierPosition
  constructor(input, details) {
    
    this.mainDiv = input
    this.modifiers = details.modifiers
    this.acceptedTags = details.acceptedTags || []
    this.whitelist = details.whitelist || false
    this.repeatedTags = details.repeatedTags || false
    this.tagClassName = details.tagClassName || "tag"
    this.inputDivClassName = details.inputDivClassName || "inputDiv"
    this.onSubmit = details.onSubmit || function(x) {};
    
    let inputDiv = document.createElement('div')
    inputDiv.contentEditable = true
    inputDiv.className = this.inputDivClassName
    input.appendChild(inputDiv)

    
    this.inputDiv = inputDiv
    this.tags = []

    this.modifier = ""
    this.modifierPosition = 0
    this.tag = false
    this.escapeTag = false
    this.tagLen = 0
  }
  setCaret(char, el=this.inputDiv) {
    let range = document.createRange()
    let sel = window.getSelection()
    let elObj = el;
    if(char == 'end') {
      if(el.childNodes.length == 0) {
        char = el.innerText.length
      } else {
        char = el.childNodes[0].data.length
        elObj = el.childNodes[0]
      }
    }

    if(elObj.childNodes.length == 0){
      return;
    }

    // console.log(el.childNodes, char)
    range.setStart(elObj.childNodes[0], char)
    // range.setEnd(elObj, 1)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
  }
  getCaretPosition(){
    let elem = this.inputDiv
    var sel = window.getSelection();
    var cum_length = [0, 0];
    if(sel.anchorNode == elem)
      cum_length = [sel.anchorOffset, sel.focusOffset, sel.focusNode];
    else {
      // console.log(sel.anchor)
      var nodes_to_find = [sel.anchorNode, sel.focusNode];
      if(!elem.contains(sel.anchorNode) || !elem.contains(sel.focusNode)) {
        return undefined;
      }else {
        var found = [0,0];
        var i;
        this.node_walk(elem, function(node) {
          for(i = 0; i < 2; i++) {
            if(node == nodes_to_find[i]) {
              found[i] = true;
              if(found[i == 0 ? 1 : 0])
                return false; // all done
            }
          }

          if(node.textContent && !node.firstChild) {
            for(i = 0; i < 2; i++) {
              if(!found[i])
                cum_length[i] += node.textContent.length;
            }
          }
        });
        cum_length[0] += sel.anchorOffset;
        cum_length[1] += sel.focusOffset;
      }
    }

    return cum_length;
  }
  node_walk(node, func) {
    var result = func(node);
    for(node = node.firstChild; result !== false && node; node = node.nextSibling)
      result = this.node_walk(node, func);
    return result;
  }
  searchForArray(haystack, needle){
    var i, j, current;
    for(i = 0; i < haystack.length; ++i){
      if(needle.length === haystack[i].length){
        current = haystack[i];
        for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
        if(j === needle.length)
          return i;
      }
    }
    return -1;
  }
  onInput(e) {
    if(this.tag == true) {
      if(this.getCaretPosition()[0] -1 < this.modifierPosition || this.escapeTag == true) {
        this.tag = false
        
        if(e.inputType === 'deleteContentBackward' || e.inputType == "deleteContentForward") {
          this.tagLen = 0
          return; 
        }
        this.createTag()
        this.tagLen = 0
        return;
      }
    }
    if(e.inputType == 'insertText') {
      if(this.modifiers.includes(e.data)) {
        this.modifierPosition = this.getCaretPosition()[0]
        this.tag = true
        this.modifier = e.data
      }
      else if(this.tag == true) {
        let currentpos = this.getCaretPosition()[0]
        // if(currentpos -1 < this.modifierPosition || this.escapeTag == true) {
        //   console.log("end", this.tagLen)
        //   this.tagLen = 0
        //   this.tag = false
        //   return;
        // }
        this.tagLen += 1
      }
    }
    if(e.inputType == 'deleteContentBackward' || e.inputType == "deleteContentForward") {
      if(this.tag == true) {
        this.tagLen -= 1
      }
    }
    if(e.inputType == 'insertParagraph') {
      e.preventDefault()
    } 
  }
  createTag(enter=false) {
    let min,max= 0
    if(this.getCaretPosition()[0] -1 < this.modifierPosition) {
      min = this.modifierPosition+1
      max = this.modifierPosition+this.tagLen+1
    }
    else if (enter == true){
      min = this.modifierPosition
      max = this.modifierPosition+this.tagLen
    }

    let tagText = this.inputDiv.innerText.substring(min, max).trim()

    if(this.whitelist == true && !this.acceptedTags.includes(tagText)) {
      console.log("not whitlisted")
      return;
    }

    this.inputDiv.innerText = this.inputDiv.innerText.substring(0, min-1) + this.inputDiv.innerText.substring(max, this.inputDiv.innerText.length)
    this.setCaret(min-1)

    if(this.repeatedTags == false && this.searchForArray(this.tags, [tagText, this.modifier]) > -1) {
      console.log("repeated")
      return;
    }

    this.addTag(tagText, this.modifier)
  }
  addTag(tagText, modifier) {
    this.tags.push([tagText, modifier])
    let tag = document.createElement("div")
    tag.innerHTML = tagText
    tag.className = this.tagClassName
    tag.id = "tag_"+(this.tags.length - 1)
    this.mainDiv.insertBefore(tag, this.inputDiv)
  }
  returnQuery() {
    return {"searchQuery":this.inputDiv.innerText.trim(), "tags":this.tags}
  }
  removeTag(index) {
    this.tags.splice(index, 1)
    this.mainDiv.removeChild(this.mainDiv.querySelector('#tag_'+index))
  }

  runFunction() {
    this.inputDiv.addEventListener('input', (e) => {
      this.onInput(e)
    });
    this.inputDiv.addEventListener('keydown', (e) => {
      if(e.key == "Enter"){
        if(this.tag == true) {
          this.createTag(true)
          this.tagLen = 0
          this.tag = false
        }
        else {
          this.onSubmit(this.returnQuery())
        }
        e.preventDefault()
      }
      if(e.key == "Backspace"){
        if (this.getCaretPosition()[0] == 0 && this.getCaretPosition()[1] == 0 && this.tags.length > 0) {
          this.removeTag(this.tags.length - 1)
          e.preventDefault()
          
        }
      }
    });
  }
}