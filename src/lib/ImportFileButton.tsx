import { Button } from "antd";
import { ButtonType } from "antd/es/button";
import React, { forwardRef } from "react";

export interface IImportFileButtonProps {
    handleClick?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    children?: React.ReactNode,
    type?: ButtonType,
}

export interface IImportFileButtonRef {

}

export const ImportFileButton = forwardRef<IImportFileButtonRef, IImportFileButtonProps>((props, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.handleClick?.(e);
    };

    return (
        <div>
            <Button type={props.type ?? "text"} onClick={handleButtonClick}>
                {props.children}
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
});

export default ImportFileButton;