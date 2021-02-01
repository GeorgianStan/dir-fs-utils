export interface UnwrapOptions {
  keepFolder?: boolean; // ? by default the folder and it's content will be deleted, if this param is set to true, then the folder will remain pristine(files will be both in the folder and outside of the folder)
  force?: boolean; // ? overwrite any files that are outside of the folders already
}
