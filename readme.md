# Tag.js: Small, Zero-depedency, Feature-rich Tag Editor

## Add to Project
```
<script src="https://cdn.jsdelivr.net/gh/Raghav-Uppala/Tag.js@main/tag.min.js"></script>
```
## Basic Usage

For basic usage, instantiate the tagJS class with a div and any options.

```
<div id="input"></div>

<script>

let input = document.querySelector('#input')
let test = new tagJS(input)

</script>
```

Note: styling is minimal by default, add your own styling to make it look better.

## Features

1. Activate tags with modifiers, can use custom modifiers
2. Supports multiple modifiers, saves which modifer.
3. Tag properties allow you to add additional data to the tag
4. Whitelisting allows you to only allow specific tags
5. It is lightweight, only 6kb!
6. Allows editing of tags
7. No custom HTML elements, this program makes use of divs with contentEditable

## API
### Options
- `modifiers` (default: `["@"]`)takes an array of a string of the modifiers.
- `whitelist` (default: `false`) takes a bool; turns on the whitelist feature
- `acceptedTags` (default: `[]`) takes a array; if `whitelist` is `true` these will be the whitelisted tags
- `repeatedTags` (default: `false`) takes a bool; if `true` tags can be repeated
- `tagProperties` (default: `false`) takes a bool; turns on the tag properties feature
- `tagPropertyDelim` (default `":"`) takes a string; if `tagProperties` is `true` everything after this delimiter will be properties. Everything before will be the tag itself
- `onSubmit` (default: `function(x) {}`) takes a function; runs when the user presses the enter button (if they are not editing or creating a tag)
- `tagDelButton` (default: `"&times"`) takes a string; this is set as the innerHTML of the delete button.
- `inputDivId` (default: `"inputDiv"`) takes a string; this is the id of the div which the user types in.
- `TagClassName` (default: `"tag"`) takes a string; this is the class name of the tags.

### Methods
- `addTag(tagName, modifier, properties)` creates and appends a tag with those properties as the second last node
- `returnString()` returns the content of the input div with an array of the tags. Return data looks like: `{"inputStr": inputDiv.innerText, "tags":[[tagName, modifier, properties], [tagName, modifier, properties], ...]}`

## Future Features
These are features underdevelopment or will be developed.

1. Choose output position for tags
2. Inline tags
3. Optional dropdown menu showing tags
4. Tag only mode
5. Non-editable and non-deleteable tags
6. Greater customizability for tag HTML and design
7. Drag and drop tags
8. Nested tags
9. Tagging based on modifers rather than tag name
