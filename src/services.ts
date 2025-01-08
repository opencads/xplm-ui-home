import axios from "axios";
import { DocumentInterface, ICheckInInput, ICheckInOutput, IImportInput, IImportOutput, ILocation, IProgress, IUserInfomation, ImportInterface, LocalSubscriber, PluginInterface, PluginSubscriber } from "./interfaces";
import SparkMD5 from 'spark-md5';
import { IDocumentRecord } from "./apps/DocumentsApp";
import pako from 'pako';
import { ILayoutTab } from "./pages/Home";
import { IWorkspaceRecord } from "./apps/WorkspacesApp";
import { IContainerRecord, IFolderRecord } from "./pages/CreateWorkspace";
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

const debug = import.meta.env.VITE_DEBUG === "true";
if (debug) {
    console.log("!!! Debug Mode");
}
export class services {
    public static FormatUrl(url: string) {
        return `http://localhost:19799${url}`;
    }
    public static GetHost() {
        return "127.0.0.1:19799";
    }
    public static FormatUIUrl(url: string) {
        return `http://localhost:12332${url}`;
    }

    public static async openUrl(url: string, location?: ILocation) {
        ///api/v1/app/open/
        if (location == undefined) {
            location = {
                x: 'center',
                y: 'center',
                width: '60%',
                height: '60%'
            };
        }
        let response = await axios.post(services.FormatUIUrl("/api/v1/app/open"), {
            url: window.location.origin + url,
            location
        });
        if (response.status === 200) {
            return true;
        } else {
            throw new Error(`${response.status}`);
        }
    }

    public static async mouseDownDrag() {
        let webapplication = (window as any).webapplication;
        if (webapplication) {
            await axios.post(services.FormatUIUrl("/api/v1/app/mousedowndrag"), {
                id: webapplication.id
            });
        }
    }

    public static async close() {
        let webapplication = (window as any).webapplication;
        if (webapplication) {
            await axios.post(services.FormatUIUrl("/api/v1/app/close"), {
                id: webapplication.id
            });
        }
    }

    public static async minimize() {
        let webapplication = (window as any).webapplication;
        if (webapplication) {
            await axios.post(services.FormatUIUrl("/api/v1/app/minimize"), {
                id: webapplication.id
            });
        }
    }

    public static async getDataByID(id: string) {
        let webapplication = (window as any).webapplication;
        if (webapplication) {
            let response = await axios.post(services.FormatUIUrl("/api/v1/app/getdatabyid"), {
                id
            });
            if (response.status === 200) {
                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(response.data.message);
                }
            }
        }
        else {
            return undefined;
        }
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
        if (debug) {
            return "D:\\Documents\\xplm-import-test";
        }
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
    public static async setDefaultDirectory(defaultDirectory: string) {
        let url = services.FormatUrl(`/api/v1/xplm/setDefaultDirectory`);
        let response = await axios.post(url, {
            defaultDirectory
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
    public static async getPluginSubscribers() {
        if (debug) {
            return [{
                url: "http://localhost:19780/api/v1/xplm",
                name: "XplmPlugin",
                type: 'git-release'
            }, {
                url: "http://localhost:19780/api/v1/xplm",
                name: "XplmPlugin2",
                type: 'git-repository'
            }] as PluginSubscriber[];
        }
        let url = services.FormatUrl(`/api/v1/xplm/getPluginSubscribers`);
        let response = await axios.get(url);
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data as PluginSubscriber[];
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async setPluginSubscribers(subscribers: PluginSubscriber[]) {
        let url = services.FormatUrl(`/api/v1/xplm/setPluginSubscribers`);
        let response = await axios.post(url, {
            subscribers
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
    public static async addPluginSubscriber(subscriber: PluginSubscriber) {
        let url = services.FormatUrl(`/api/v1/xplm/addPluginSubscriber`);
        let response = await axios.post(url, {
            subscriber
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
    public static async getLocalSubscribers() {
        if (debug) {
            return [{
                url: "http://localhost:19780/api/v1/xplm",
                name: "XplmPlugin",
            }, {
                url: "http://localhost:19780/api/v1/xplm",
                name: "XplmPlugin2",
            }] as LocalSubscriber[];
        }
        let url = services.FormatUrl(`/api/v1/xplm/getLocalSubscribers`);
        let response = await axios.get(url);
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data as LocalSubscriber[];
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    public static async getPlugins() {
        if (debug) {
            return [{
                Name: "openfile",
                Entry: "openfile.exe {input}",
            }, {
                Name: "export",
                Entry: "export.exe {input}",
            }] as PluginInterface[];
        }
        let url = services.FormatUrl(`/api/v1/xplm/getPlugins`);
        let response = await axios.get(url);
        if (response.status === 200) {
            if (response.data.success) {
                return response.data.data as PluginInterface[];
            } else {
                throw new Error(response.data.message);
            }
        }
        else {
            throw new Error(`${response.status}`);
        }
    }
    //removeLocalSubscriber
    public static async removeLocalSubscriber(name: string) {
        let url = services.FormatUrl(`/api/v1/xplm/removeLocalSubscriber`);
        let response = await axios.post(url, {
            name
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
    public static async updatePlugins() {
        let url = services.FormatUrl(`/api/v1/xplm/updatePlugins`);
        let response = await axios.post(url);
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
    private static async pluginRunAsync(pluginName: string, input: any) {
        let response = await axios.post(services.FormatUrl(`/api/v1/tasks/plugin/runasync`), input, {
            params: {
                pluginName: pluginName
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
    public static async runPluginAsync(pluginName: string, input: { [key: string]: any }, onProgress: (progress: IProgress) => void) {
        let task_id = await services.pluginRunAsync(pluginName, input);
        let subscribeProgress = new Promise<void>((resolve, reject) => {
            // 建立websocket连接，订阅
            let ws = new WebSocket(`ws://${services.GetHost()}/`);
            ws.binaryType = 'arraybuffer';
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    task_id: task_id,
                    url: "/api/v1/tasks/subscribeprogress"
                }));
            }
            ws.onmessage = (event) => {
                let data = JSON.parse(event.data);
                if (data.progress) {
                    onProgress(data.progress as IProgress);
                }
            }
            ws.onclose = () => {
                resolve();
            }
        });
        await subscribeProgress;
        let response = await axios.get(services.FormatUrl("/api/v1/tasks/query"), {
            params: {
                id: task_id
            }
        });
        if (response.data.success) {
            return response.data.data.Output;
        }
        else {
            throw new Error(response.data.message)
        }
    }
    public static async importFilesToWorkspace(input: IImportInput) {
        return await services.runPlugin("workspace-import-files", input) as IImportOutput[];
    }
    public static async importFilesToWorkspaceAsync(input: IImportInput, onProgress: (progress: IProgress) => void) {
        return await services.runPluginAsync("workspace-import-files", input, onProgress) as IImportOutput[];
    }
    public static async login(username: string, password: string) {
        return await services.runPlugin("login", {
            username,
            password
        }) as IUserInfomation;
    }
    public static async logout() {
        return await services.runPlugin("logout", {
        });
    }
    public static async getUserInfo() {
        return await services.runPlugin("get-user-info", {}) as IUserInfomation;
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
    public static async getDocumentsFromWorkspace(path: string, remoteWorkspaceId: string) {
        return await services.runPlugin("workspace-get-documents", {
            path,
            remoteWorkspaceId
        }) as {
            Documents: IDocumentRecord[],
        };
    }
    public static async getDocumentsFromWorkspaceAsync(path: string, remoteWorkspaceId: string, onProgress: (progress: IProgress) => void) {
        return await services.runPluginAsync("workspace-get-documents", {
            path,
            remoteWorkspaceId
        }, onProgress) as {
            Documents: IDocumentRecord[],
        };
    }
    public static async checkinDocuments(input: ICheckInInput) {
        return await services.runPlugin("checkin", input);
    }
    public static async getSettings() {
        return await services.runPlugin("get-settings", {});
    }
    public static async getLoginInfo() {
        return await services.runPlugin("get-login-info", {}) as {
            username?: string,
            password?: string,
            remember?: boolean
        };
    }
    public static async setLoginInfo(username: string, password: string, remember: boolean) {
        return await services.runPlugin("set-login-info", {
            username,
            password,
            remember
        });
    }
    public static async getLayout() {
        return await services.runPlugin("get-layout", {}) as {
            tabs?: ILayoutTab[]
        };
    }
    public static async getRemoteWorkspaces() {
        return await services.runPlugin("remote-workspaces-get", {}) as IWorkspaceRecord[];
    }
    public static async activeRemoteWorkspaces(record: IWorkspaceRecord) {
        return await services.runPlugin("remote-workspaces-active", record) as {
            isActive: boolean
        };
    }

    public static async getContainers() {
        return await services.runPlugin("containers-get", {}) as IContainerRecord[];
    }

    public static async getContainerFolders(container: IContainerRecord) {
        return await services.runPlugin("container-folders-get", container) as IFolderRecord[];
    }
    public static async createWorkspace(container: IContainerRecord, name: string, path: string) {
        return await services.runPlugin("remote-workspaces-create", {
            container,
            name,
            path
        });
    }
    public static async deleteRemoteWorkspace(workspace: IWorkspaceRecord) {
        return await services.runPlugin("remote-workspaces-delete", workspace);
    }
}