import { Uri, workspace, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import { WritableStreamBuffer } from 'stream-buffers';
import { FileObserver, FileFilter } from './diff';

export class ProjectTemplate {
    private uri: Uri;

    constructor(uri: Uri) {
        this.uri = uri;
    }

    async build(): Promise<Uri> {
        const projectConfig = this.createDefaultProjectConfig();
        const jsonFilePath = path.join(this.uri.fsPath, 'project.json');
        const mainFilePath = path.join(this.uri.fsPath, 'main.js');
        this.backupExistingFiles(mainFilePath, jsonFilePath);
        await fs.promises.writeFile(mainFilePath, "toast('Hello, AutoX.js');");
        await projectConfig.save(jsonFilePath);
        return this.uri;
    }

    private createDefaultProjectConfig(): ProjectConfig {
        const projectConfig = new ProjectConfig();
        projectConfig.name = '新建项目';
        projectConfig.main = 'main.js';
        projectConfig.ignore = ['build'];
        projectConfig.packageName = 'com.example';
        projectConfig.versionName = '1.0.0';
        projectConfig.versionCode = 1;
        return projectConfig;
    }

    private backupExistingFiles(mainFilePath: string, jsonFilePath: string): void {
        if (fs.existsSync(mainFilePath)) {
            fs.renameSync(mainFilePath, `${mainFilePath}.backup`);
        }
        if (fs.existsSync(jsonFilePath)) {
            fs.renameSync(jsonFilePath, `${jsonFilePath}.backup`);
        }
    }
}

export class Project {
    config: ProjectConfig;
    folder: Uri;
    private watcher: FileSystemWatcher;

    constructor(folder: Uri) {
        this.folder = folder;
        this.config = ProjectConfig.fromJsonFile(path.join(this.folder.fsPath, 'project.json'));
        this.watcher = workspace.createFileSystemWatcher(new vscode.RelativePattern(this.folder.fsPath, 'project.json'));
        this.watcher.onDidChange(this.onProjectConfigChanged.bind(this));
    }

    private onProjectConfigChanged(event: Uri): void {
        if (event.fsPath === path.join(this.folder.fsPath, 'project.json')) {
            this.config = ProjectConfig.fromJsonFile(event.fsPath);
        }
    }

    dispose(): void {
        this.watcher.dispose();
    }

    fileFilter(relativePath: string, absPath: string): boolean {
        return !this.config.ignore.some(p => absPath.startsWith(path.join(this.folder.fsPath, p)));
    }
}

export class ProjectObserver {
    folder: string;
    private fileObserver: FileObserver;
    private fileFilter: FileFilter;

    constructor(folder: string, filter: FileFilter) {
        this.folder = folder;
        this.fileFilter = filter;
        this.fileObserver = new FileObserver(folder, filter);
    }

    async diff(): Promise<{ buffer: Buffer, md5: string }> {
        const changedFiles = await this.fileObserver.walk();
        const zip = archiver('zip');
        const streamBuffer = new WritableStreamBuffer();

        zip.pipe(streamBuffer);
        changedFiles.forEach(relativePath => {
            zip.append(fs.createReadStream(path.join(this.folder, relativePath)), { name: relativePath });
        });
        await zip.finalize();

        const contents = streamBuffer.getContents() || Buffer.alloc(0);
        const md5 = crypto.createHash('md5').update(contents).digest('hex');
        return { buffer: contents, md5 };
    }
}

export class ProjectConfig {
    name: string;
    icon: string;
    packageName: string;
    main: string;
    versionCode: number;
    versionName: string;
    ignore: string[];
    launchConfig: LaunchConfig;

    async save(filePath: string): Promise<void> {
        const json = JSON.stringify(this, null, 4);
        await fs.promises.writeFile(filePath, json);
    }

    static fromJson(text: string): ProjectConfig {
        const config = JSON.parse(text) as ProjectConfig;
        config.ignore = (config.ignore || []).map(p => path.normalize(p));
        return config;
    }

    static fromJsonFile(filePath: string): ProjectConfig {
        const text = fs.readFileSync(filePath, 'utf-8');
        return ProjectConfig.fromJson(text);
    }
}

export class LaunchConfig {
    hideLogs: boolean;
}
