import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";
import { WebViewerPreviewProps } from "../typings/WebViewerProps";

declare function require(name: string): string;

export class preview extends Component<WebViewerPreviewProps> {
    render(): ReactNode {
        const viewerProps = {
            file: this.props.fileAttributeUrl || this.props.fileUrl,
            l: this.props.l
        };
        return <PDFViewer {...viewerProps} />;
    }
}

export function getPreviewCss(): string {
    return require("./ui/WebViewer.css");
}
