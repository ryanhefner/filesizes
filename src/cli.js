#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import program from 'commander';
import chalk from 'chalk';
import Table from 'cli-table';
import gzipSize from 'gzip-size';
import prettyBytes from 'pretty-bytes';
import pkg from './package.json';
import {
  fileSizes,
  EXCLUDE_FILES,
  EXCLUDE_DIRECTORIES,
} from './index';

const list = (value = '') => value.split(',').map(value => value.trim());

let dirVal = './';

program
  .version(pkg.version)
  .arguments('[dir]')
  .option('-f, --exclude-files [excludeFiles]', 'File names or patterns used to exclude files from the listing.', list)
  .option('-d, --exclude-dirs [excludeDirs]', 'Directory names or patterns used to exclude directories from the listing.', list)
  .option('-l, --large-file [largeFile]', 'File size that desinates a file as being too large if it meets or exceeds this value.')
  .option('-v, --verbose', 'Output the progress while iterating over files and directories.')
  .action((dir) => {
    dirVal = dir;
  })
  .parse(process.argv);

const table = new Table({
  head: [
    chalk.cyanBright('File'),
    chalk.cyanBright('Size'),
    chalk.cyanBright('Size (gzipped)'),
  ],
  colAligns: [
    'left',
    'right',
    'right',
  ],
});

const fileInfo = fileSizes({
  dir: path.join(process.cwd(), dirVal),
  excludeFile: program.excludeFiles || EXCLUDE_FILES,
  excludeDirs: program.excludeDirs || EXCLUDE_DIRECTORIES,
  verbose: program.verbose,
});

let totalFileSize = 0;
let totalFileSizeGzip = 0;

if (program.verbose) {
  const stream = process.stderr;
  stream.clearLine();
  stream.cursorTo(0);
  stream.write('Rendering...');
}

fileInfo.forEach((info) => {
  const fileSize = program.largeFile && info.size > program.largeFile
    ? chalk.red(prettyBytes(info.size))
    : prettyBytes(info.size);

  const gzipFileSize = gzipSize.sync(fs.readFileSync(path.join(path.join(process.cwd(), dirVal), info.name)));

  totalFileSize += info.size;
  totalFileSizeGzip += gzipFileSize;

  table.push([
    info.name,
    fileSize,
    program.largeFile && gzipFileSize > program.largeFile
      ? chalk.red(prettyBytes(gzipFileSize))
      : prettyBytes(gzipFileSize),
  ]);
});

table.push([]);

table.push([
  `Total files: ${fileInfo.length}`,
  prettyBytes(totalFileSize),
  prettyBytes(totalFileSizeGzip),
]);

if (program.verbose) {
  stream.clearLine();
  stream.cursorTo(0);
}

console.log(table.toString());

console.log('\n');
