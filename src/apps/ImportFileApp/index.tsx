import { forwardRef } from "react";
import ImportFileButton from "../../lib/ImportFileButton";
import { services } from "../../services";
import { MessageInstance } from "antd/es/message/interface";
import { IImportInput } from "../../interfaces";
import { Path } from "../../natived";

export interface IImportFileAppProps {
    messageApi: MessageInstance
}

export interface IImportFileAppRef { }

export const ImportFileApp = forwardRef<IImportFileAppRef, IImportFileAppProps>((props, ref) => {
    return <ImportFileButton handleClick={async e => {
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
        }
        catch (e: any) {
            props.messageApi.error(e);
        }
    }}>{"Import Files"}</ImportFileButton>;
});