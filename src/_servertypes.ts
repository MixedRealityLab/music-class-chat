import type * as sapper from '@sapper/server';
import type {Db} from 'mongodb';

interface App {
  locals: AppLocals;
}

interface AppLocals {
  db: Db;
}

export interface ServerRequest extends sapper.SapperRequest {
  session: any;
  app: App;
}
