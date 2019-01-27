const fs = require("fs");
const path = require("path");
const escapeRegExp = require("./utils/regex").escapeRegExp;
const JSZip = require("jszip");


class Replacer {


	constructor(options = {}) {
		const defaults = {
			input: {
				path: null
			},
			output: {
				name: null,
				writeFile: false,
			},
			replace: {
				srcFiles: [],// Or *
				replacements: []//{key: '', value: '', escapeKey: false, files: null}
			}
		};
		this.options = {...defaults, ...options};
		this.currentOutputPath = null;
		this.zip = null;
		this._checkRequirements();
		this._sortReplacements();
	}

	_checkRequirements() {
		if (!this.options.input.path || !fs.existsSync(this.options.input.path)) {
			throw Error("Missing `input.path`");
		}
	}

	/**
	 * Replacement keys must be sorted from longest to shortest.
	 * @private
	 */
	_sortReplacements() {
		this.options.replace.replacements = this.options.replace.replacements.filter(item => (item.key || "").trim() !== "").sort((a, b) => b.key.length - a.key.length);
	}

	/**
	 * Reads the zip file and sets the internal param
	 * @returns {Promise<*>}
	 * @private
	 */
	async _loadZip() {
		let promise = new JSZip.external.Promise((resolve, reject) => {
			fs.readFile(this.options.input.path, function (err, data) {
				if (err) {
					reject(e);
				} else {
					resolve(data);
				}
			});
		}).then(function (data) {
			return JSZip.loadAsync(data);
		}).then(function (zip) {
			return zip;
		});
		let zip = await promise;

		this.zip = zip;
		return zip;
	}

	/**
	 * Get the output name or generate a random key
	 * @returns {null|string}
	 * @private
	 */
	_getOutputName() {
		return this.options.output.name || ((Math.floor(new Date() / 1000) + '-' + Math.floor(Math.random() * (9999 - 0) + 9999)) + path.extname(this.options.input.path));
	}

	/**
	 * Do the replacements
	 * @returns {Promise<boolean>}
	 * @private
	 */
	async _doReplacement() {
		const srcFiles = this.options.replace.srcFiles;
		if (srcFiles === '*') {
			//TODO load all files and run replacements
		} else {
			for (let i in srcFiles) {
				let srcFile = srcFiles[i];
				let fileContent = await this.zip.file(srcFile).async("string");
				try {
					//Loop through the replacement keys and replace the content
					this.options.replace.replacements.forEach(item => {
						//TODO Implement replacement filters
						// if (item.files) {
						// 	let files = [].concat(item.files);
						// }
						let regex = item.escapeKey ? new RegExp(escapeRegExp(item.key), "g") : new RegExp(item.key, "g");
						fileContent = fileContent.replace(regex, item.value);
					});
					//Re-add the file back into the zip
					this.zip.file(srcFile, fileContent);
				} catch (e) {
					throw e;
				}
			}
		}
		return true;
	}


	async replace() {
		const zip = await this._loadZip();
		let completed = await this._doReplacement();


		let stream = this.zip
			.generateNodeStream({type: 'nodebuffer', streamFiles: true});

		if (this.options.output.writeFile) {
			const outputName = this._getOutputName();

			stream.pipe(fs.createWriteStream(outputName))
				.on('finish', () => {
					console.log(outputName);
				});
		}
		return stream;
	}
}

module.exports = Replacer;