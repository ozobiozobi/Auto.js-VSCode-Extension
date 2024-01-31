import { Uri } from "vscode";
import * as vscode from "vscode";
import * as fs from "fs";
import { FileObserver, FileFilter } from "./diff";
import archiver from 'archiver'
import * as path from 'path'
import * as cryto from 'crypto'
import * as walk from 'walk'
import * as streamBuffers from 'stream-buffers'
import * as crypto from 'crypto';
import { WritableStreamBuffer } from 'stream-buffers';


export class ProjectTemplate {

    private uri: Uri;

    constructor(uri: Uri) {
        this.uri = uri;
    }

    build(): Thenable<Uri> {
        const projectConfig = new ProjectConfig();
        projectConfig.name = "新建项目";
        projectConfig.main = "main.js";
        projectConfig.ignore = ["build"];
        projectConfig.packageName = "com.example";
        projectConfig.versionName = "1.0.0";
        projectConfig.versionCode = 1;
        const uri = this.uri;
        const jsonFilePath = path.join(uri.fsPath, "project.json");
        const mainFilePath = path.join(uri.fsPath, "main.js");
        if(fs.existsSync(mainFilePath)){
          fs.renameSync(mainFilePath,mainFilePath+".backup");
        }
        if(fs.existsSync(jsonFilePath)){
          fs.renameSync(jsonFilePath,jsonFilePath+".backup");
        }
        const mainScript = "toast('Hello, AutoX.js');";
        return projectConfig.save(jsonFilePath)
            .then(() => {
                return new Promise<Uri>(function (res, rej) {
                    fs.writeFile(mainFilePath, mainScript, function (err) {
                        if (err) {
                            rej(err);
                            return;
                        }
                        res(uri);
                    })
                });
            });
    }
}

export class Project {
    config: ProjectConfig;
    folder: Uri;
    fileFilter = (relativePath: string, absPath: string) => {
        return this.config.ignore.filter(p => {
            const fullPath = path.join(this.folder.fsPath, p);
            return absPath.startsWith(fullPath);
        }).length == 0;
    };
    private watcher: vscode.FileSystemWatcher;

    constructor(folder: Uri) {
        this.folder = folder;
        this.config = ProjectConfig.fromJsonFile(path.join(this.folder.fsPath, "project.json"));
        this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder.fsPath, "project.json"));
        this.watcher.onDidChange((event) => {
            console.log("file changed: ", event.fsPath);
            if (event.fsPath == path.join(this.folder.fsPath, "project.json")) {
                this.config = ProjectConfig.fromJsonFile(event.fsPath);
                console.log("project.json changed: ", this.config);
            }
        });
    }

    dispose() {
        this.watcher.dispose();
    }

}


export class ProjectObserser {
    folder: string;
    private fileObserver: FileObserver
    private fileFilter: FileFilter;

    constructor(folder: string, filter: FileFilter) {
        this.folder = folder;
        this.fileFilter = filter;
        this.fileObserver = new FileObserver(folder, filter);
    }

    diff(): Promise<{ buffer: Buffer, md5: string }> {
        return this.fileObserver.walk()
            .then(changedFiles => {
                const zip = archiver('zip')
                
                const streamBuffer: WritableStreamBuffer = new WritableStreamBuffer();
                zip.pipe(streamBuffer);
                changedFiles.forEach(relativePath => {
                    zip.append(fs.createReadStream(path.join(this.folder, relativePath)), { name: relativePath })
                });
                zip.finalize();
                return new Promise<Buffer>((res) => {
                    zip.on('finish', () => {
                        const contents = streamBuffer.getContents() || Buffer.alloc(0); // 如果getContents()返回false，则创建一个空的Buffer
                        res(contents); // 现在contents保证是一个Buffer实例
                    });
                    
                });
            })
            .then(buffer => {
                const md5 = cryto.createHash('md5').update(buffer).digest('hex');
                return {
                    buffer: buffer,
                    md5: md5
                };
            });
    }

    zip(): Promise<{ buffer: Buffer, md5: string }> {
        return new Promise<{ buffer: Buffer, md5: string }>((resolve) => {
            const walker = walk.walk(this.folder);
            const zip = archiver('zip');
            const streamBuffer = new streamBuffers.WritableStreamBuffer();
            zip.pipe(streamBuffer);
            walker.on("file", (root, stat, next) => {
                const filePath = path.join(root, stat.name);
                const relativePath = path.relative(this.folder, filePath);
                if (!this.fileFilter(relativePath, filePath, stat)) {
                    next();
                    return;
                }
                zip.append(fs.createReadStream(path.join(this.folder, relativePath)), { name: relativePath })
                next();
            });
            walker.on("end", () => {
                zip.finalize();
                zip.on('finish', () => {
    const contents = streamBuffer.getContents();
    // Check if contents is actually a Buffer, not false
    if (contents instanceof Buffer) {
        // Proceed with the Buffer
        const md5 = crypto.createHash('md5').update(contents).digest('hex');
        streamBuffer.end();
        resolve({ buffer: contents, md5 });
    } else {
        // Handle the case where no contents were returned
        // For example, by rejecting the promise or resolving with an empty Buffer
        resolve({ buffer: Buffer.alloc(0), md5: '' }); // Example with an empty Buffer
    }
});
                zip.on('error', (error) => {
                    throw error; // 抛出错误
                });
            });
        });
    }
}

export class LaunchConfig {
    hideLogs: boolean;
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

    save(path: string) {
        return new Promise((res, rej) => {
            const json = JSON.stringify(this, null, 4);
            fs.writeFile(path, json, function (err) {
                if (err) {
                    rej(err);
                    return;
                }
                res(path);
            });
        });
    }

    static fromJson(text: string): ProjectConfig {
        const config = JSON.parse(text) as ProjectConfig;
        config.ignore = (config.ignore || []).map(p => path.normalize(p));
        return config;
    }

    static fromJsonFile(path: string): ProjectConfig {
        const text = fs.readFileSync(path).toString("utf-8");
        const config = JSON.parse(text) as ProjectConfig;
        config.ignore = (config.ignore || []);
        return config;
    }
}