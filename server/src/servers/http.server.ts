import { createServer, Server } from 'http';
import express, { Application } from 'express';

export class HttpServer {
  private app: Application;
  public server: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }

  public listen(port: number, callback: () => void): void {
    this.server.listen(port, callback);
  }
}
