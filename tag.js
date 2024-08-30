//   _______                _      
//  |__   __|              (_)     
//     | |  __ _   __ _     _  ___ 
//     | | / _` | / _` |   | |/ __|
//     | || (_| || (_| | _ | |\__ \
//     |_| \__,_| \__, |(_)| ||___/
//                 __/ |  _/ |     
//                |___/  |__/      
//
//
// A fast and powerful tag editor for search bars
//
// Copyright 2024, Raghav Uppala, All rights reserved.

class tagJS {
  constructor(input, details) {
    
    this.mainDiv = input
    this.modifiers = details.modifiers || ["@"]
    this.acceptedTags = details.acceptedTags || []
    this.whitelist = details.whitelist || false
    this.repeatedTags = details.repeatedTags || []
    this.tagClassName = details.tagClassName || "tag"
    this.inputDivClassName = details.inputDivClassName || "inputDiv"
    this.tagProperties = details.tagProperties || false
    this.tagPropertyDelim = details.tagPropertyDelim || ":"
    this.onSubmit = details.onSubmit || function(x) {};
    this.inputDivId = details.inputDivId || "inputDiv";
    this.tagDelButton = details.tagDelButton || "&times"

    let inputDiv = document.createElement('div')
    inputDiv.contentEditable = true
    inputDiv.className = this.inputDivClassName
    inputDiv.id = this.inputDivId
    input.appendChild(inputDiv)

    
    this.inputDiv = inputDiv
    this.tags = []
    this.tagsids = [this.inputDivId]
    this.focusElem = this.inputDiv

    this.modifier = ""
    this.modifierPosition = 0
    this.tag = false
    this.escapeTag = false
    this.tagLen = 0
    this.runFunction()
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
    let elem = document.activeElement
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
      if(this.getCaretPosition()[0] < this.modifierPosition || this.escapeTag == true) {
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
  createTag(enter = false) {
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
    let tagName = tagText
    let tagVals = []
    if(this.tagProperties == true && tagText.includes(this.tagPropertyDelim)) {
      [tagName, tagVals] = tagText.split(this.tagPropertyDelim)
      tagVals = tagVals.split(",").map(elem => elem.trim());
    }
    if(this.whitelist == true && !this.acceptedTags.includes(tagName)) {
      // let acceptedTag = false
      // if(this.tagProperties)
      console.log("not whitelisted")
      return;
    }

    this.inputDiv.innerText = this.inputDiv.innerText.substring(0, min-1) + this.inputDiv.innerText.substring(max, this.inputDiv.innerText.length)
    this.setCaret(min-1)

    if(this.repeatedTags == false && this.searchForArray(this.tags, [tagName, this.modifier, tagVals]) > -1) {
      console.log("repeated")
      return;
    }

    this.addTag(tagName, this.modifier, tagVals)
  }
  addTag(tagName, modifier, properties) {
    this.tags.push([tagName, modifier, properties])
    this.tagsids.splice(this.tagsids.length - 1, 0, "tag_"+(this.tags.length - 1))
    let tag = document.createElement("div")
    
    let tagbutton = document.createElement("div")
    tagbutton.className = "tagDelButton"
    tagbutton.innerHTML = this.tagDelButton
    tagbutton.onclick = () => {this.removeTag(this.tags.length - 1)}

    let tagContent = document.createElement("div")
    tagContent.innerText = tagName + (properties.length != 0 ? ":"+properties : "")
    tagContent.contentEditable = true
    tagContent.id = "tag_"+(this.tags.length - 1)+"_editor"
    
    tag.className = this.tagClassName
    tag.id = "tag_"+(this.tags.length - 1)
    
    this.mainDiv.insertBefore(tag, this.inputDiv)
    tag.prepend(tagbutton)
    tag.append(tagContent)
  }
  returnString() {
    return {"inputStr":this.inputDiv.innerText.trim(), "tags":this.tags}
  }
  removeTag(index) {
    this.changeFocus(-1)
    this.tags.splice(index, 1)
    this.tagsids.splice(index, 1)
    this.mainDiv.removeChild(this.mainDiv.querySelector('#tag_'+index))
  }
  changeFocus(num, elem=false) {
    let currentElm = this.focusElem
    let currentElmId = this.focusElem.id
    let currentElmIndex = this.tagsids.indexOf(currentElmId)
    let newElem;
    if(elem == false) {
      let newElemId
      if(currentElmIndex+num < 0) {
        newElemId = this.tagsids[this.tagsids.length + (currentElmIndex + num)]
      } else if (currentElmIndex+num > this.tagsids.length - 1) {
        newElemId = this.tagsids[(currentElmIndex + num - this.tagsids.length)]
      }else {
        newElemId = this.tagsids[currentElmIndex +num]
      }

      newElem = this.mainDiv.querySelector("#"+newElemId)
      this.focusElem = newElem

      if(newElemId.includes("tag_")) {
        newElem = newElem.querySelector("#"+newElemId+"_editor")
      }
      if(currentElmId.includes("tag_")) {
        currentElm = currentElm.querySelector("#"+currentElmId+"_editor")
        currentElm.innerText = this.tags[currentElmIndex][0] + (this.tags[currentElmIndex][2].length != 0 ? ":"+this.tags[currentElmIndex][2] : "")
      }
    } else {
      newElem = elem
      this.focusElem = newElem
    }

    newElem.contentEditable = true
    currentElm.contentEditable = false
    newElem.focus()
  }
  editTag(index, tagText) {
    if(this.tags[index] == undefined) {
      return;
    }
    let tagName = tagText
    let tagVals = []
    let tag = document.querySelector("#tag_"+index).querySelector("#tag_"+index+"_editor")

    if(this.tagProperties == true && tagText.includes(this.tagPropertyDelim)) {
      [tagName, tagVals] = tagText.split(this.tagPropertyDelim)
      tagVals = tagVals.split(",").map(elem => elem.trim());
    }
    if(this.whitelist == true && !this.acceptedTags.includes(tagName)) {
      console.log("not whitelisted")
      tag.innerText = this.tags[index][0] + (this.tags[index][2].length != 0 ? ":"+this.tags[index][2] : "")
      return;
    }
    this.tags[index] = [tagName, this.modifier, tagVals]
    tag.innerText = tagName + (tagVals.length != 0 ? ":"+tagVals : "")
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
      }
    });
    this.mainDiv.addEventListener('keydown', (e) => {
      if(this.tags.length > 0) {
        if(e.key == "ArrowLeft") {
          if(this.getCaretPosition()[0] == 0 && this.getCaretPosition()[1] == 0) {
            this.changeFocus(-1)
          }
        }
        if(e.key == "ArrowRight") {
          if(this.getCaretPosition()[0] == document.activeElement.innerText.length && this.getCaretPosition()[1] == document.activeElement.innerText.length) {
            this.changeFocus(1)
          }
        }
      }
      if(e.key == "Backspace"){
        if (this.getCaretPosition()[0] == 0 && this.getCaretPosition()[1] == 0 && this.tags.length > 0) {
          if(this.focusElem == this.inputDiv) {
            this.removeTag(this.tags.length - 1)
          }
          else {
            this.removeTag(this.focusElem.id.split("_")[1])
          }
          e.preventDefault()
          
        }
      }
      if(e.key == "Enter"){
        if(document.activeElement.id.includes("tag")) {
          let index = this.tagsids.indexOf(this.focusElem.id)
          this.editTag(index, this.focusElem.querySelector("#tag_"+index+"_editor").innerText)
          this.changeFocus(0, this.inputDiv)
        }
        e.preventDefault()
      }
    });
  }
}