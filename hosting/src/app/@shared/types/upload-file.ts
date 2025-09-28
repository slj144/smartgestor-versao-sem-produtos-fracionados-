import { IStorage } from "@itools/interfaces/IStorage";

export type uploadFIle = {
  storageRef: IStorage,
  settings: {
    sourceUrl?: string;
    bindData?: {
      img?: any
    },
    dataFile?: any;
    file?: FileList | File,
    path?: string,
    name?: string
  }[]
};