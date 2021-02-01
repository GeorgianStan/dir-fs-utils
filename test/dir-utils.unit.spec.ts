/**
 * * Mocks
 */
import { promises as fsPromises } from 'fs';
import path from 'path';

/**
 * * Constants
 */
import { ALL_PATHS, ONLY_FILES, EACH_FILE_SIZE } from './unit-data';

/**
 * * Test Target
 */
import { DirUtils } from '../dist/dir-utils';

describe('Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listFolderContent()', () => {
    // *
    it('It should throw an error in case that the supplied path is not accessible', async () => {
      const spy = jest.spyOn(fsPromises, 'access').mockImplementation(() => {
        throw new Error();
      });

      await expect(DirUtils.listFolderContent('./')).rejects.toThrow(Error);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('./');
    });

    // *
    it('Should read all the files from a folder', async () => {
      jest
        .spyOn(fsPromises, 'access')
        .mockImplementation(() => Promise.resolve());

      // ? just return the second value which will be the file from test-data
      jest.spyOn(path, 'join').mockImplementation((...paths) => paths[1]);

      // ? mock two times in order to stop the execution, bcs is a recursive function
      jest
        .spyOn(fsPromises, 'readdir')
        //@ts-ignore
        .mockImplementationOnce(() => Promise.resolve(ALL_PATHS))
        .mockImplementation(() => Promise.resolve([]));

      jest.spyOn(fsPromises, 'lstat').mockImplementation((path: any): any => {
        let isDir = true;
        if (path.indexOf('.') !== -1) {
          isDir = false;
        }

        return Promise.resolve({ isDirectory: () => isDir });
      });

      const readFiles: string[] = await DirUtils.listFolderContent('./');
      expect(readFiles).toEqual(ONLY_FILES);
    });
  });

  describe('getFolderSize()', () => {
    // *
    it('It should throw an error in case that the supplied path is not accessible', async () => {
      const spy = jest.spyOn(fsPromises, 'access').mockImplementation(() => {
        throw new Error();
      });

      await expect(DirUtils.getFolderSize('./')).rejects.toThrow(Error);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('./');
    });

    // *
    it('Should return the total size of the files', async () => {
      jest
        .spyOn(fsPromises, 'access')
        .mockImplementation(() => Promise.resolve());

      // ? just return the second value which will be the file from test-data
      jest.spyOn(path, 'join').mockImplementation((...paths) => paths[1]);

      // ? mock two times in order to stop the execution, bcs is a recursive function
      jest
        .spyOn(fsPromises, 'readdir')
        //@ts-ignore
        .mockImplementationOnce(() => Promise.resolve(ALL_PATHS))
        .mockImplementation(() => Promise.resolve([]));

      jest.spyOn(fsPromises, 'lstat').mockImplementation((path: any): any => {
        let isDir = true;
        if (path.indexOf('.') !== -1) {
          isDir = false;
        }

        return Promise.resolve({
          isDirectory: () => isDir,
          size: EACH_FILE_SIZE,
        });
      });

      const totalSize: number = await DirUtils.getFolderSize('./');
      expect(totalSize).toEqual(ONLY_FILES.length * EACH_FILE_SIZE);
    });
  });
});
