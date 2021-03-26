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
  data?:Buffer;
}

interface MyFiles {
  spreadsheet?: UploadedFile;
}

export interface ServerRequest extends sapper.SapperRequest {
  session: any;
  app: App;
  files: MyFiles;
  body?: any;
  protocol: string
  hostname: string
}
