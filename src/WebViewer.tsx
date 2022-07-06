import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";

import { WebViewerContainerProps } from "../typings/WebViewerProps";

import "./ui/WebViewer.css";

export default class WebViewer extends Component<WebViewerContainerProps> {
    render(): ReactNode {
        const viewerProps = {
            file: this.props.fileAttributeUrl?.value || this.props.fileUrl,
            l: this.props.l
        };
        return <PDFViewer {...viewerProps} />;
    }
}
