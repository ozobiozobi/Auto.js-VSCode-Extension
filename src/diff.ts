import * as fs from 'fs';
import * as path from 'path';

export type FileFilter = (relativePath: string, filePath: string, stats: fs.Stats) => boolean;

export class FileObserver {
    private dir: string;
    private files = new Map<string, number>();
    private filter: FileFilter;

    constructor(dirPath: string, filter: FileFilter = (() => true)) {
        this.dir = dirPath;
        this.filter = filter;
    }

    walk(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const changedFiles: string[] = [];
            this.getFiles(this.dir, changedFiles, reject);
            resolve(changedFiles);
        });
    }

    private getFiles(rootPath: string, fileList: string[], reject: (reason?: Error) => void): void {
        let files: fs.Dirent[];
        try {
            files = fs.readdirSync(rootPath, { withFileTypes: true });
        } catch (error) {
            reject(error);
            return;
        }

        for (const dirent of files) {
            const filePath = path.join(rootPath, dirent.name);
            const relativePath = path.relative(this.dir, filePath);
            if (dirent.isDirectory()) {
                this.getFiles(filePath, fileList, reject); // 递归调用处理目录
            } else if (dirent.isFile()) {
                const stats = fs.statSync(filePath);
                if (this.filter(relativePath, filePath, stats)) {
                    const millis = stats.mtime.getTime();
                    if (!this.files.has(filePath) || this.files.get(filePath) !== millis) {
                        this.files.set(filePath, millis);
                        fileList.push(relativePath);
                    }
                }
            }
        }
    }
}
