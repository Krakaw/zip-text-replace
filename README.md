# zip-text-replace
Unzip a file, replace text within a file and re-zip it.

```javascript
let replaceDocx = new Replacer({
		input: {
			path: "./test_input.docx"
		},
		output: {
			name: "test_output.docx",
			writeFile: true
		},
		replace:{
			srcFiles: ["word/document.xml"],
			replacements: [
				{
					key: "{replace_me}",
					value: "My New Text",
					escapeKey: true
				}
			]
		}
	});
	replaceDocx.replace();

	let replacerXlsx = new Replacer({
		input: {
			path: "./test_input.xlsx"
		},
		output: {
			name: "test_output.xlsx",
			writeFile: false //Get a stream instead
		},
		replace:{
			srcFiles: ["xl/sharedStrings.xml"],
			replacements: [
				{
					key: "{replace_me}",
					value: "Another New String",
					escapeKey: true
				}
			]
		}

	});
  const stream = replacerXlsx.replace();
```
