# Dir Utils

<div style='text-align:center'>
    <img src='https://img.shields.io/github/issues/GeorgianStan/dir-fs-utils' alt='issues'>
    <img src='https://img.shields.io/github/forks/GeorgianStan/dir-fs-utils' alt='forks'>
    <img src='https://img.shields.io/github/stars/GeorgianStan/dir-fs-utils' alt='stars'>
    <img src='https://img.shields.io/github/license/GeorgianStan/dir-fs-utils' alt='license'>
    <img src='https://img.shields.io/github/package-json/v/GeorgianStan/dir-fs-utils?color=%237146f9&logo=javascript' alt='version'>
    <a href="https://david-dm.org/georgianstan/dir-fs-utils" title="dependencies status"><img src="https://status.david-dm.org/gh/georgianstan/dir-fs-utils.svg"/></a>

</div>

`dir-fs-utils` is aiming to be a collection of the utility functions for directories build on top of the native `fs` module.

## Installation

```bash
npm i dir-fs-utils
```

Then anywhere in your code.

```ts
import { DirUtils } from 'dir-fs-utils`
```

or

```js
const { DirUtils } = require('dir-fs-utils');
```

## How to use it

```javascript
await DirUtils.getFolderSize(folder_path);

await DirUtils.listFolderContent(folder_path);
```

## Methods <sub style='font-size:15px'>(3)</sub>

(1)

```typescript
async listFolderContent(path: string): Promise<string[]> {}
```

This method will return an array with all the files in a folder.

**If the provided path does not exist or is not accessible, then it will generate an error.**

---

(2)

```ts
async getFolderSize(path: string): Promise<number> {}
```

This method will return the total size of a folder in bytes.

**If the provided path does not exist or is not accessible, then it will generate an error.**

---

(3)

```ts
async unwrap(folderPath: string, options?: UnwrapOptions): Promise<Map<string, string>>
```

```ts
export interface UnwrapOptions {
  keepFolder?: boolean;
  force?: boolean;
}
```

This method will open the contents of a folder. By default, it will remove the original folder and undo only files for which the destination path does not exist.

The returned value is a map that will contain all the files that failed to be unwrapped. If the size of the map is 0, then all the files were unwrapped successfully.

- `keepFolder?:boolean` - if this property is set to **true**, then the original folder will remain intact(files will not be deleted)
- `force?:boolean` - if this property is set to **true**, then the destination of the unwrapped files will overwritten

---

## Contributing

Pull requests and stars are always welcome. Please check the [guidelines](https://github.com/GeorgianStan/dir-fs-utils/blob/master/CONTRIBUTING.md).

## Stay in touch

Author - [Stan Georgian](https://twitter.com/GeorgianStan9)

## License

This project is licensed under the [MIT License](https://github.com/GeorgianStan/dir-fs-utils/blob/master/LICENSE)
