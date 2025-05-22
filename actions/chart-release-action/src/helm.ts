// src/helm.ts
import { execa } from 'execa';
import * as path from 'path';

export interface ExecOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export class Helm {
  constructor(private helmBinary = 'helm') { }

  private exec(args: string[], opts: ExecOptions = {}) {
    return execa(this.helmBinary, args, { stdio: 'inherit', ...opts });
  }

  dependencyUpdate(chartDir: string, opts?: ExecOptions) {
    const dir = path.resolve(chartDir);
    return this.exec(['dependency', 'update', dir], opts);
  }

  package(chartDir: string, destination?: string, opts?: ExecOptions) {
    const args = ['package', path.resolve(chartDir)];
    if (destination) args.push('--destination', path.resolve(destination));
    return this.exec(args, opts);
  }

}
