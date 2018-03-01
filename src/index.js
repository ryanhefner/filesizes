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
  dir = './',
  excludeFiles = EXCLUDED_FILES,
  excludeDirs = EXCLUDED_DIRECTORIES,
  verbose = false,
}, filesChecked = [], depth = 0) => {
  const contents = fs.readdirSync(dir);

  // Filter files from contents
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

  // Filter directories from contents
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

  // Add file information to filesChecked
  files.forEach((file, index) => {
    const directories = dir.split('/');
    const fileStats = fs.statSync(path.join(dir, file));
    const fileName = depth > 0
      ? `${directories.splice(directories.length - depth, depth).join('/')}/${file}`
      : `${file}`;

    if (verbose) {
      log(`Processing: ${fileName} - ${prettyBytes(fileStats.size)}...${index % 2 === 0 ? '—' : '|'}`)
    }

    filesChecked.push({
      name: fileName,
      size: fileStats.size,
    });
  });

  // If directories exist, increase depth and iterate over each
  if (directories.length) {
    depth++;
    directories.forEach((directory) => {
      fileSizes({
        dir: `${dir}/${directory}`,
        excludeFiles,
        excludeDirs,
        verbose,
      }, filesChecked, depth);
    });
  }

  return filesChecked;
};
