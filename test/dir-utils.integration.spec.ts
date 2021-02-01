/**
 * * Dependencies
 */
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * * Test Target
 */
import { DirUtils } from '../dist/dir-utils';
import { TEST_FOLDER_SIZE } from './integration-data';

/**
 * * Constants
 */
const TEST_FOLDER = path.join(process.cwd(), 'test', 'test-folder');
const UNWRAP_TEST_FOLDER = path.join(process.cwd(), 'test', 'unwrap-folder');

const FOLDER_TO_UNWRAP = path.join(UNWRAP_TEST_FOLDER, 'folder-to-unwrap');
const FOLDER_TO_UNWRAP_INITIAL_FILE_COUNT = 2;

const EXPECTED_FILES_PATH = [
  path.join(process.cwd(), 'test', 'test-folder', 'me.txt'),
  path.join(process.cwd(), 'test', 'test-folder', 'sub-folder', 'me.txt'),
];

describe('Integration tests', () => {
  describe('listFolderContent()', () => {
    // *
    it('It should throw an error in case that the supplied path is not accessible', async () => {
      await expect(
        DirUtils.listFolderContent('./test-folder/wrong-path'),
      ).rejects.toThrow(Error);
    });

    // *
    it('Should read all the files from a folder', async () => {
      const readFiles: string[] = await DirUtils.listFolderContent(TEST_FOLDER);
      expect(readFiles).toEqual(EXPECTED_FILES_PATH);
    });
  });

  describe('getFolderSize()', () => {
    // *
    it('It should throw an error in case that the supplied path is not accessible', async () => {
      await expect(
        DirUtils.getFolderSize('./test-folder/wrong-path'),
      ).rejects.toThrow(Error);
    });

    // *
    it('Should return the total size of the files', async () => {
      const totalSize: number = await DirUtils.getFolderSize(TEST_FOLDER);
      expect(totalSize).toBe(TEST_FOLDER_SIZE);
    });
  });

  describe('unwrap()', () => {
    const tmpName = `${UNWRAP_TEST_FOLDER}-tmp`;

    beforeEach(() => {
      // ? Make a copy to FOLDER_TO_UNWRAP
      child_process.execSync(`cp -R ${UNWRAP_TEST_FOLDER} ${tmpName}`);
    });

    afterEach(() => {
      child_process.execSync(`rm -r ${UNWRAP_TEST_FOLDER}`);
      child_process.execSync(`mv ${tmpName} ${UNWRAP_TEST_FOLDER}`);
    });

    // *
    it('It should throw an error in case that the supplied path is not accessible', async () => {
      await expect(
        DirUtils.unwrap('./test-folder/wrong-path'),
      ).rejects.toThrow();
    });

    // *
    it('Should throw an error if the path is not a folder', async () => {
      await expect(
        DirUtils.unwrap(FOLDER_TO_UNWRAP + '/simple.txt'),
      ).rejects.toThrow();
    });

    // *
    it('If force option was not provided, should return one file that was not unwraped, because the dest path already exists', async () => {
      const failMap: Map<string, string> = await DirUtils.unwrap(
        FOLDER_TO_UNWRAP,
      );

      const remainedFiles: string[] = await DirUtils.listFolderContent(
        FOLDER_TO_UNWRAP,
      );

      expect(remainedFiles.length).toBe(
        FOLDER_TO_UNWRAP_INITIAL_FILE_COUNT - 1,
      );

      expect(failMap.size).toBe(1);
    });

    it('If force option was provided, then it should overwrite the file that already exits', async () => {
      const failMap: Map<string, string> = await DirUtils.unwrap(
        FOLDER_TO_UNWRAP,
        {
          force: true,
        },
      );

      const remainedFiles: string[] = await DirUtils.listFolderContent(
        FOLDER_TO_UNWRAP,
      );

      expect(remainedFiles.length).toBe(
        FOLDER_TO_UNWRAP_INITIAL_FILE_COUNT - 2,
      );
      expect(failMap.size).toBe(0);
    });

    it('If keepFolder option was provided, then it should not delete the original folder', async () => {
      const failMap: Map<string, string> = await DirUtils.unwrap(
        FOLDER_TO_UNWRAP,
        {
          force: true,
          keepFolder: true,
        },
      );

      const remainedFiles: string[] = await DirUtils.listFolderContent(
        FOLDER_TO_UNWRAP,
      );

      expect(remainedFiles.length).toBe(FOLDER_TO_UNWRAP_INITIAL_FILE_COUNT);
      expect(failMap.size).toBe(0);
    });
  });
});
