import * as path from 'path';
import * as moduleAlias from 'module-alias';


moduleAlias.addAliases({
  '@config': path.join(__dirname, 'config'),
  '@constant': path.join(__dirname, 'constant'),
  '@controllers': path.join(__dirname, 'controllers'),
  '@dao': path.join(__dirname, 'dao'),
  '@dto': path.join(__dirname, 'dto'),
  '@enum': path.join(__dirname, 'enum'),
  '@interfaces': path.join(__dirname, 'interfaces'),
  '@loaders': path.join(__dirname, 'loaders'),
  '@models': path.join(__dirname, 'models'),
  '@responces': path.join(__dirname, 'responces'),
  '@routes': path.join(__dirname, 'routes'),
  '@servers': path.join(__dirname, 'servers'),
  '@services': path.join(__dirname, 'services'),
  '@utils': path.join(__dirname, 'utils'),
});
import { AppConfig } from '@config';
import { ExpressLoader, SQLLoader } from '@loaders';
import { HttpServer } from '@servers';
import { logger } from '@utils';
import { TransactionDao } from '@dao';

class App {
  private httpServer: HttpServer;

  constructor() {
    this.httpServer = new HttpServer();
    this.loadLoaders();
  }

  private loadLoaders(): void {
    const expressLoader = new ExpressLoader(this.httpServer.getApp());
    const db = SQLLoader.getInstance();
    db.getSequelizeInstance()?.sync();
    expressLoader.load();
  }

  public startServer(): void {
    const port = AppConfig.APP_PORT;
    this.httpServer.listen(port, () => {
      logger.info(`✅ Server started successfully on ports ${port}!`);
    });
  }
}

const app = new App();
app.startServer();

