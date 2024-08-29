class tagJS {
  modifiers;
  inputDiv;
  modifierPosition
  constructor(input, details) {
    let inputDiv = document.createElement('div')
    inputDiv.contentEditable = true
    input.appendChild(inputDiv)
    
    this.mainDiv = input
    this.inputDiv = inputDiv
    this.modifiers = details.modifiers
    this.acceptedTags = details.acceptedTags || []
    this.whitelist = details.whitelist || false
    this.repeatedTags = details.repeatedTags || false
    this.tagClassName = details.tagClassName || "tag"

    this.tags = []

    this.modifier = ""
    this.modifierPosition = 0
    this.tag = false
    this.escapeTag = false
    this.tagLen = 0
  }
  getCaretPosition(){
    let elem = this.inputDiv
    var sel = window.getSelection();
    var cum_length = [0, 0];
    if(sel.anchorNode == elem)
      cum_length = [sel.anchorOffset, sel.focusNode];
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
    // console.log(sel.anchorNode,sel.focusOffset, "CUM_LENGTH")
    if(cum_length[0] <= cum_length[1]) {
      return cum_length;
    }
    return [cum_length[0], cum_length[1]];
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

    let tagText = this.inputDiv.innerText.substring(min, max)

    if(this.whitelist == true && !this.acceptedTags.includes(tagText)) {
      console.log("not whitlisted")
      return;
    }

    this.inputDiv.innerText = this.inputDiv.innerText.substring(0, min-1) + this.inputDiv.innerText.substring(max, this.inputDiv.innerText.length)

    if(this.repeatedTags == false && this.searchForArray(this.tags, [tagText, this.modifier]) > -1) {
      console.log("repeated")
      return;
    }

    this.addTag(tagText, this.modifier)
  }
  addTag(tagText, modifier) {
    console.log(2, this.tags, this.tags.length)
    this.tags.push([tagText, modifier])
    console.log(3, this.tags, this.tags.length)
    let tag = document.createElement("div")
    tag.innerHTML = tagText
    tag.className = this.tagClassName
    this.mainDiv.insertBefore(tag, this.inputDiv)
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
        e.preventDefault()
      }
    });
  }
}