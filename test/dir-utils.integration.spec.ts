/**
 * * Mocks
 */
import path from 'path';

/**
 * * Test Target
 */
import { DirUtils } from '../dist/dir-utils';
import { TEST_FOLDER_SIZE } from './integration-data';

/**
 * * Constants
 */
const TEST_FOLDER = path.join(process.cwd(), 'test', 'test-folder');
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
});
