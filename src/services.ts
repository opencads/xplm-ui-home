import axios from "axios";
import { DocumentInterface, IImportInput, ImportInterface } from "./interfaces";
import SparkMD5 from 'spark-md5';
export type Guid = string;
const Util = {
    calculateFileMD5: (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // 使用 FileReader 读取文件内容  
            reader.readAsArrayBuffer(file);

            reader.onload = (e) => {
                const buffer = e.target?.result;
                if (buffer) {
                    // 判断buffer是string还是ArrayBuffer
                    if (buffer instanceof ArrayBuffer) {
                        const md5 = SparkMD5.ArrayBuffer.hash(buffer);
                        resolve(md5);
                    } else {
                        // buffer 是 string
                        const md5 = SparkMD5.hash(buffer);
                        resolve(md5);
                    }
                } else {
                    reject('Failed to read file');
                }
            };

            reader.onerror = () => {
                reject('Failed to read file');
            };
        });
    }
}
export class services {
    public static FormatUrl(url: string) {
        return `http://localhost:19799${url}`;
    }
    public static async import(data: ImportInterface[]) {
        let url = services.FormatUrl("/api/v1/xplm/import");
        let response = await axios.post(url, {
            data
        });
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async getDocumentsByDirectory(directory: string) {
        let url = services.FormatUrl(`/api/v1/xplm/getDocumentsByDirectory`);
        let response = await axios.get(url, {
            params: {
                directory
            }
        });
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async getDefaultDirectory() {
        let url = services.FormatUrl(`/api/v1/xplm/getDefaultDirectory`);
        let response = await axios.get(url);
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async runPlugin(pluginName: string, input: any) {
        let response = await axios.post(services.FormatUrl(`/api/v1/tasks/run`), {
            Input: input,
            Processor: {
                Type: "Plugin",
                Name: pluginName
            }
        });
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data.Output;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async importFiles(input: IImportInput) {
        return await services.runPlugin("import-files", input) as {
            importResult: DocumentInterface[],
        };
    }
    public static async downloadToDefaultDirectory(fileID: Guid, fileName: string) {
        let url = services.FormatUrl(`/api/v1/xplm/downloadToDefaultDirectory`);
        let response = await axios.post(url, {
            fileID,
            fileName
        });
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async Upload(file: File) {
        // 计算文件内容的MD5
        const fileName = file.name;
        const contentMD5 = await Util.calculateFileMD5(file);
        const fileMD5 = SparkMD5.hash(file.name + contentMD5);
        let response = await axios.post(services.FormatUrl("/api/v1/iostorage/upload"), file, {
            params: {
                fileName: fileName,
                fileMD5: fileMD5,
                contentMD5: contentMD5,
            }
        });
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data as string;
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
}