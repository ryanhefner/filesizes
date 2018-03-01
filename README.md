# 📂⚖️ filesizes

Easily review the size of files in a given directory and its subdirectories.

## Install

Via [NPM](https://npmjs.com/package/filesizes)

```sh
npm install --save filesizes
```

CLI (command line tool)

```sh
npm install -g filesizes
```

## How to use

You can use this module in two ways. The first, is a simple way to get an array of all the file names and the size of each file within a given directory and its subdirectories. You can also use the included CLI (command line tool) that lets you initiate the command against a folder on your machine.

Here are some examples on how you would use them, both in a project or via the command line.

### Import

Using this tool in your project, it returns an array for each file that include the `name` and `size` for each file that match your criteria. This can be handy for CMS tools that need to show a listing of files and their file sizes, or if you have some admin features that you want to use to manage files on your server.

#### Example

```js
import fileSizes from 'filesizes';

const fileInfo = fileSizes();
fileInfo.forEach(info => console.log(file.name, file.size));
```

#### Options

The `fileSizes` method accepts an object allowing you to define the options that are used when generating the array of file names and sizes. The following options can be set when you execute the method.

* `dir` - Initial directory to traverse the files and subdirectories. (Default: `./`)
* `excludeFiles` - Array of either basic strings or regular expressions of files to exclude from the list. (Default: `['.DS_Store', '.DS_Store?', '.Spotlight-V100', '.Trashes', 'ehthumbs.db', 'Thumbs.db']`)
* `excludeDirectories` - Array of either basic string or regular expressions of directories to exclude from the list. (Default: `['.git', 'node_modules', 'vendor']`)
* `verbose` - For use when running the CLI command. Outputs progress of files checked while traversing the directory. (Default: `false`)

### CLI (command line tool)

In addition to the standard method, this module includes a handy command line tool that lets you run the command and generates a table listing all the files that match your criteria, along with their file size and size of file when gzipped.

I’ve found this handy for being able to quickly assess the size of assets for a project, or hunt down a large file that is taking up too much space on my computer.

#### Examples

```sh
$ filesizes [options] [dir]
```

Initiate command with options and `dir` argument. Listing all files in the `public` directory in the current directory and flagging files that are greater than 1,000,000 bytes (1 MB).

```sh
$ filesizes -l 1000000 public
```

#### Arguments

* `dir` - Initial directory to traverse the files and subdirectories. (Default: `./`)

#### Options

* `-f, --exclude-file` - Comma-delimited list of either basic strings or regular expressions of files to exclude from the list. (Default: `'.DS_Store, .DS_Store?, .Spotlight-V100, .Trashes, ehthumbs.db, Thumbs.db'`)
* `-d, --exclude-directories` - Comma-delimited list of either basic string or regular expressions of directories to exclude from the list. (Default: `'.git, node_modules, vendor'`)
* `-l, --large-file` - Size used to flag a file as being too large. Files that meet or exceed this value will be represented in `red` in the outputted table. (Default: `null`)
* `-v, --verbose` - Output the progress of files checked while traversing the directory.

## License

[MIT](LICENSE) © [Ryan Hefner](https://www.ryanhefner.com)
