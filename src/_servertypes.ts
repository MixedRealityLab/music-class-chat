import type * as sapper from '@sapper/server';
import type {Db} from 'mongodb';

interface App {
  locals: AppLocals;
}

interface AppLocals {
  db: Db;
}

// for express-fileupload
interface UploadedFile extends File {
  mimetype: string;
}

interface MyFiles {
  spreadsheet?: UploadedFile;
}

export interface ServerRequest extends sapper.SapperRequest {
  session: any;
  app: App;
  files: MyFiles;
}
