/**
 * * Dependencies
 */
import * as fs from 'fs';
import {
  lstat,
  readdir,
  Stats,
  accessSync,
  copyFile,
  access,
  mkdir,
  unlink,
} from 'fs';
import { join, basename, sep, dirname } from 'path';
import * as util from 'util';

const { COPYFILE_EXCL } = fs.constants;

/**
 * * Types
 */
import { UnwrapOptions } from './@types';

class Class {
  /**
   * * Private methods
   */
  #accessPromisify: any = util.promisify(access);
  #copyFilePromisify: any = util.promisify(copyFile);
  #mkDirPromisify: any = util.promisify(mkdir);
  #unlinkPromisify: any = util.promisify(unlink);

  /**
   * * readDirPromisify
   * ? readdir as promise
   * @param path
   */
  #readDirPromisify = async (path: string): Promise<string[]> => {
    return new Promise((resolve) => {
      readdir(path, (err: any, files: string[]) => {
        resolve(files || []);
      });
    });
  };

  /**
   * * lstatPromisify()
   * ? lstat as promise
   * @param path
   */
  #lstatPromisify = async (path: string): Promise<Stats> => {
    return new Promise((resolve) => {
      lstat(path, (err: any, stats: Stats) => {
        resolve(stats);
      });
    });
  };

  /**
   * * Public methods
   */
  async listFolderContent(path: string): Promise<string[]> {
    try {
      accessSync(path);
    } catch (err) {
      throw new Error('The supplied path is not accessible');
    }

    const output: string[] = [];

    const clojure = async (path: string) => {
      const files: string[] = await this.#readDirPromisify(path);
      await Promise.all(
        files.map(async (file: string) => {
          const filePath = join(path, file);

          const stats: Stats = await this.#lstatPromisify(filePath);
          if (stats.isDirectory()) {
            await clojure(filePath);
            return;
          }

          output.push(filePath);
        }),
      );
    };

    await clojure(path);

    return output;
  }

  async getFolderSize(path: string): Promise<number> {
    try {
      accessSync(path);
    } catch (err) {
      throw new Error('The supplied path is not accessible');
    }

    let totalSize = 0;

    const clojure = async (path: string) => {
      const files: string[] = await this.#readDirPromisify(path);

      await Promise.all(
        files.map(async (file: string) => {
          const filePath = join(path, file);

          const stats: Stats = await this.#lstatPromisify(filePath);
          if (stats.isDirectory()) {
            return clojure(filePath);
          }

          totalSize += stats.size;
        }),
      );
    };

    await clojure(path);

    return totalSize;
  }

  /**
   * ? Unwrap a folder
   * @param folderPath
   * @param keepFolder -
   */
  async unwrap(
    folderPath: string,
    options?: UnwrapOptions,
  ): Promise<Map<string, string>> {
    try {
      await this.#accessPromisify(folderPath);
    } catch {
      throw new Error('The supplied path is not accessible');
    }

    // ? check if is a directory
    const stats: Stats = await this.#lstatPromisify(folderPath);
    if (!stats.isDirectory()) {
      throw new Error('The supplied path is not a directory');
    }

    // ? get the folder name
    const folderName: string = basename(folderPath);

    // ? create a map with the paths that needs to be unwraped
    // ? originalPath and targetPath
    const pathsToUnwrap: Map<string, string> = new Map();
    const successfulUnwrapps: Map<string, string> = new Map();
    const failedUnwrapps: Map<string, string> = new Map();

    const clojure = async (path: string) => {
      const files: string[] = await this.#readDirPromisify(path);
      await Promise.all(
        files.map(async (file: string) => {
          const filePath = join(path, file);

          const stats: Stats = await this.#lstatPromisify(filePath);
          if (stats.isDirectory()) {
            return clojure(filePath);
          }

          const targetPath: string = filePath.replace(sep + folderName, '');
          pathsToUnwrap.set(filePath, targetPath);
        }),
      );
    };

    await clojure(folderPath);

    // ? unwrap the paths
    for (let [filePath, targetPath] of pathsToUnwrap) {
      try {
        // ? create the folder path if it doesn't exist
        const targetFolderPath: string = dirname(targetPath);

        try {
          await this.#accessPromisify(targetFolderPath);
        } catch {
          await this.#mkDirPromisify(targetFolderPath, { recursive: true });
        }

        await this.#copyFilePromisify(
          filePath,
          targetPath,
          options?.force ? null : COPYFILE_EXCL,
        );

        successfulUnwrapps.set(filePath, targetPath);
      } catch {
        failedUnwrapps.set(filePath, targetPath);
      }
    }

    // ? delete the source folder if all the files were removed
    if (!options?.keepFolder) {
      for (let filePath of successfulUnwrapps.keys()) {
        await this.#unlinkPromisify(filePath);
      }
    }

    return failedUnwrapps;
  }
}

const DirUtils = new Class();
Object.freeze(DirUtils);

export { DirUtils };
