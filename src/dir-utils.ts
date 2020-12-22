/**
 * * Dependencies
 */
import { lstat, readdir, Stats, accessSync } from 'fs';
import { join } from 'path';

class Class {
  /**
   * * Private methods
   */

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
}

const DirUtils = new Class();
Object.freeze(DirUtils);

export { DirUtils };
