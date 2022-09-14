import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";
import { WebViewerPreviewProps } from "../typings/WebViewerProps";

declare function require(name: string): string;

export class preview extends Component<WebViewerPreviewProps> {
    render(): ReactNode {
        const viewerProps = {
            containerHeight: this.props.containerHeight,
            file: this.props.fileAttributeUrl || this.props.fileUrl,
            fileId: this.props.fileId,
            enableFilePicker: this.props.enableFilePicker,
            annotationUser: this.props.annotationUser,
            accessibleMode: this.props.accessibleMode,
            enableMeasurement: this.props.enableMeasurement,
            enableRedaction: this.props.enableRedaction,
            enableAnnotations: this.props.enableAnnotations,
            loadAsPDF: this.props.loadAsPDF,
            highContrastMode: this.props.highContrastMode,
            notesInLeftPanel: this.props.notesInLeftPanel,
            enabledElements: this.props.enabledElements,
            disabledElements: this.props.disabledElements,
            selectAnnotationOnCreation: this.props.selectAnnotationOnCreation,
            enableDarkMode: this.props.enableDarkMode,
            enableFullAPI: this.props.enableFullAPI,
            customCss: this.props.customCss,
            defaultLanguage: this.props.defaultLanguage,
            l: this.props.l,
            enableDocumentUpdates: this.props.enableDocumentUpdates
        };
        return <PDFViewer {...viewerProps} />;
    }
}

export function getPreviewCss(): string {
    return require("./ui/WebViewer.css");
}
