import { forwardRef } from "react";
import ImportFileButton from "../../lib/ImportFileButton";
import { services } from "../../services";
import { MessageInstance } from "antd/es/message/interface";
import { IImportInput } from "../../interfaces";
import { Path } from "../../natived";

export interface IImportFileAppProps {
    messageApi: MessageInstance,
    showLoading?: (loading: boolean) => void,
    onImported?: () => Promise<void>,
}

export interface IImportFileAppRef { }

export const ImportFileApp = forwardRef<IImportFileAppRef, IImportFileAppProps>((props, ref) => {
    return <ImportFileButton handleClick={async e => {
        props.showLoading?.(true);
        try {
            let items = [] as {
                fileName: string,
                fileID: string,
                file: File
            }[];
            if (e.target.files == undefined) {
                throw `No files selected`;
            }
            for (let i = 0; i < e.target.files.length; i++) {
                let file = e.target.files[i];
                items.push({
                    fileName: file.name,
                    fileID: await services.Upload(file),
                    file: file,
                });
            }
            for (let item of items) {
                await services.downloadToDefaultDirectory(item.fileID, item.fileName);
            }
            let imports = {
                Items: []
            } as IImportInput;
            for (let item of items) {
                imports.Items.push({
                    FilePath: Path.Combine(await services.getDefaultDirectory(), item.fileName)
                });
            }
            await services.importFilesToWorkspace(imports);
            if (props.onImported) {
                await props.onImported();
            }

        }
        catch (e: any) {
            props.messageApi.error(e.message ?? "");
        }
        props.showLoading?.(false);
    }}>{"Import Files"}</ImportFileButton>;
});