/**
 * * Dependencies
 */
import {
  promises as fsPromises,
  constants as FsConstants,
  Stats as FsStats,
} from 'fs';
const { COPYFILE_EXCL } = FsConstants;

import * as path from 'path';

/**
 * * Types
 */
import { UnwrapOptions } from './@types';

class Class {
  /**
   * * Private methods
   */

  /**
   * * Public methods
   */
  async listFolderContent(folderPath: string): Promise<string[]> {
    try {
      await fsPromises.access(folderPath);
    } catch (err) {
      throw new Error('The supplied path is not accessible');
    }

    const output: string[] = [];

    const clojure = async (folderPath: string) => {
      const files: string[] = await fsPromises.readdir(folderPath);
      await Promise.all(
        files.map(async (file: string) => {
          const filePath = path.join(folderPath, file);

          const stats: FsStats = await fsPromises.lstat(filePath);
          if (stats.isDirectory()) {
            await clojure(filePath);
            return;
          }

          output.push(filePath);
        }),
      );
    };

    await clojure(folderPath);

    return output;
  }

  async getFolderSize(folderPath: string): Promise<number> {
    try {
      await fsPromises.access(folderPath);
    } catch (err) {
      throw new Error('The supplied path is not accessible');
    }

    let totalSize = 0;

    const clojure = async (folderPath: string) => {
      const files: string[] = await fsPromises.readdir(folderPath);

      await Promise.all(
        files.map(async (file: string) => {
          const filePath = path.join(folderPath, file);

          const stats: FsStats = await fsPromises.lstat(filePath);
          if (stats.isDirectory()) {
            return clojure(filePath);
          }

          totalSize += stats.size;
        }),
      );
    };

    await clojure(folderPath);

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
      await fsPromises.access(folderPath);
    } catch {
      throw new Error('The supplied path is not accessible');
    }

    // ? check if is a directory
    const stats: FsStats = await fsPromises.lstat(folderPath);
    if (!stats.isDirectory()) {
      throw new Error('The supplied path is not a directory');
    }

    // ? get the folder name
    const folderName: string = path.basename(folderPath);

    // ? create a map with the paths that needs to be unwraped
    // ? originalPath and targetPath
    const pathsToUnwrap: Map<string, string> = new Map();
    const successfulUnwrapps: Map<string, string> = new Map();
    const failedUnwrapps: Map<string, string> = new Map();

    const clojure = async (folderPath: string) => {
      const files: string[] = await fsPromises.readdir(folderPath);
      await Promise.all(
        files.map(async (file: string) => {
          const filePath = path.join(folderPath, file);

          const stats: FsStats = await fsPromises.lstat(filePath);
          if (stats.isDirectory()) {
            return clojure(filePath);
          }

          const targetPath: string = filePath.replace(
            path.sep + folderName,
            '',
          );
          pathsToUnwrap.set(filePath, targetPath);
        }),
      );
    };

    await clojure(folderPath);

    // ? unwrap the paths
    for (let [filePath, targetPath] of pathsToUnwrap) {
      try {
        // ? create the folder path if it doesn't exist
        const targetFolderPath: string = path.dirname(targetPath);

        try {
          await fsPromises.access(targetFolderPath);
        } catch {
          await fsPromises.mkdir(targetFolderPath, { recursive: true });
        }

        await fsPromises.copyFile(
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
        await fsPromises.unlink(filePath);
      }
    }

    return failedUnwrapps;
  }
}

const DirUtils = new Class();
Object.freeze(DirUtils);

export { DirUtils };
