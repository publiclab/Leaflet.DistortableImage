const fs = require('fs');
const glob = require('glob');
const { promisify } = require('es6-promisify');
const revHash = require('rev-hash');

const readFile = promisify(fs.readFile);
const listFiles = promisify(glob);

const joinContent = async (promises, separator) => promises
  .reduce(async (acc, curr) => `${await acc}${(await acc).length ? separator : ''}${await curr}`, '');

class MergeIntoFile {
  constructor(options, onComplete) {
    this.options = options;
    this.onComplete = onComplete;
  }

  apply(compiler) {
    if (compiler.hooks) {
      const plugin = { name: 'MergeIntoFile' };
      compiler.hooks.emit.tapAsync(plugin, this.run.bind(this));
    } else {
      compiler.plugin('emit', this.run.bind(this));
    }
  }

  static getHashOfRelatedFile(assets, fileName) {
    let hashPart = null;
    Object.keys(assets).forEach((existingFileName) => {
      const match = existingFileName.match(/-([0-9a-f]+)(\.min)?(\.\w+)(\.map)?$/);
      const fileHashPart = match && match.length && match[1];
      if (fileHashPart) {
        const canonicalFileName = existingFileName.replace(`-${fileHashPart}`, '').replace(/\.map$/, '');
        if (canonicalFileName === fileName.replace(/\.map$/, '')) {
          hashPart = fileHashPart;
        }
      }
    });
    return hashPart;
  }

  run(compilation, callback) {
    const { files, transform, encoding, hash, chunks } = this.options;
    if (chunks && compilation.chunks && compilation.chunks
      .filter(chunk => chunks.indexOf(chunk.name) >= 0 && chunk.rendered).length === 0) {
      callback();
      return;
    }
    const generatedFiles = {};
    let filesCanonical = [];
    if (!Array.isArray(files)) {
      Object.keys(files).forEach((newFile) => {
        filesCanonical.push({
          src: files[newFile],
          dest: newFile,
        });
      });
    } else {
      filesCanonical = files;
    }
    filesCanonical.forEach((fileTransform) => {
      if (typeof fileTransform.dest === 'string') {
        const destFileName = fileTransform.dest;
        fileTransform.dest = code => ({ // eslint-disable-line no-param-reassign
          [destFileName]: (transform && transform[destFileName])
            ? transform[destFileName](code)
            : code,
        });
      }
    });
    const finalPromises = filesCanonical.map(async (fileTransform) => {
      const listOfLists = await Promise.all(fileTransform.src.map(path => listFiles(path, null)));
      const flattenedList = Array.prototype.concat.apply([], listOfLists);
      const filesContentPromises = flattenedList.map(path => readFile(path, encoding || 'utf-8'));
      const content = await joinContent(filesContentPromises, '\n');
      const resultsFiles = await fileTransform.dest(content);
      Object.keys(resultsFiles).forEach((newFileName) => {
        let newFileNameHashed = newFileName;
        if (hash) {
          const hashPart = MergeIntoFile.getHashOfRelatedFile(compilation.assets, newFileName)
            || revHash(resultsFiles[newFileName]);
          newFileNameHashed = newFileName.replace(/(\.min)?\.\w+(\.map)?$/, suffix => `-${hashPart}${suffix}`);

          const fileId = newFileName.replace(/\.map$/, '').replace(/\.\w+$/, '');
          const chunk = compilation.addChunk(fileId);
          chunk.id = fileId;
          chunk.ids = [chunk.id];
          chunk.files.push(newFileNameHashed);
        }
        generatedFiles[newFileName] = newFileNameHashed;
        compilation.assets[newFileNameHashed] = { // eslint-disable-line no-param-reassign
          source() {
            return resultsFiles[newFileName];
          },
          size() {
            return resultsFiles[newFileName].length;
          },
        };
      });
    });

    Promise.all(finalPromises)
      .then(() => {
        if (this.onComplete) {
          this.onComplete(generatedFiles);
        }
        callback();
      })
      .catch(error => callback(error));
  }
}

module.exports = MergeIntoFile;
