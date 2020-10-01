import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";
import { WebViewerPreviewProps } from "../typings/WebViewerProps";

declare function require(name: string): string;

export class preview extends Component<WebViewerPreviewProps> {
    render(): ReactNode {
        return <PDFViewer value={this.props.textAttribute} />;
    }
}

export function getPreviewCss(): string {
    return require("./ui/WebViewer.css");
}
