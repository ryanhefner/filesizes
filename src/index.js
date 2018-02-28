import fs from 'fs';
import path from 'path';
import prettyBytes from 'pretty-bytes';

/**
 * File names that are excluded by default
 */
export const EXCLUDED_FILES = [
  '.DS_Store',
  '.DS_Store?',
  '.Spotlight-V100',
  '.Trashes',
  'ehthumbs.db',
  'Thumbs.db',
];

/**
 * Directories that are excluded by default
 */
export const EXCLUDED_DIRECTORIES = [
  '.git',
  'node_modules',
  'vendor',
];

const stream = process.stderr;

/**
 * Log status to terminal while processing
 *
 * @param {string} value
 * @return void
 */
const log = (value) => {
  stream.clearLine();
  stream.cursorTo(0);
  stream.write(value);
};

/**
 * Check content to see if it matches a rule literal or regular expression
 *
 * @param {string} content
 * @param {array} rules
 * @return bool
 */
const contentMatch = (content, rules) => {
    return rules.find((rule) => {
        return new RegExp(rule).test(content);
    }) !== undefined;
};


/**
 * Iterate through the directory and return an array containing the file name
 * and size for all files that are included in the valid filenames and directories.
 *
 * @param {object} options
 * @param {Array} filesChecked - (Default: [])
 * @param {Number} depth - (Default: 0)
 * @return {array}
 */
export const fileSizes = ({
  dir,
  excludeFiles = EXCLUDED_FILES,
  excludeDirs = EXCLUDED_DIRECTORIES,
  includeLogs = false,
  verbose = false,
}, filesChecked = [], depth = 0) => {
  const contents = fs.readdirSync(dir);

  const files = contents.filter((content) => {
    try {
      const stats = fs.statSync(path.join(dir, content));
      return stats
        && !stats.isDirectory()
        && !contentMatch(content, excludeFiles);
    }
    catch (err) {
      return false;
    }
  });

  const directories = contents.filter((content) => {
    try {
      const stats = fs.statSync(path.join(dir, content));
      return stats
        && stats.isDirectory()
        && !contentMatch(content, excludeDirs);
    }
    catch (err) {
      return false;
    }
  });

  files.forEach((file, index) => {
    const directories = dir.split('/');
    const fileStats = fs.statSync(path.join(dir, file));
    const fileName = depth > 0
      ? `${directories.splice(directories.length - depth, depth).join('/')}/${file}`
      : `${file}`;

    if (includeLogs) {
      log(`Processing: ${fileName} - ${prettyBytes(fileStats.size)}...${index % 2 === 0 ? '—' : '|'}`)
    }

    filesChecked.push({
      name: fileName,
      size: fileStats.size,
    });
  });

  if (directories.length) {
    depth++;
    directories.forEach((directory) => {
      fileSizes({
        dir: `${dir}/${directory}`,
        excludeFiles,
        excludeDirs,
        includeLogs,
        verbose,
      }, filesChecked, depth);
    });
  }

  return filesChecked;
};
