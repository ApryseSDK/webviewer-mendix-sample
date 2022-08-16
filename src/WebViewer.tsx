import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";

import { WebViewerContainerProps } from "../typings/WebViewerProps";

import "./ui/WebViewer.css";

export default class WebViewer extends Component<WebViewerContainerProps> {
    render(): ReactNode {
        const viewerProps = {
            containerHeight: this.props.containerHeight,
            file: this.props.fileAttributeUrl?.value || this.props.fileUrl,
            enableFilePicker: this.props.enableFilePicker,
            annotationUser: this.props.annotationUser?.value,
            accessibleMode: this.props.accessibleMode,
            enableMeasurement: this.props.enableMeasurement,
            enableRedaction: this.props.enableRedaction,
            enableAnnotations: this.props.enableAnnotations,
            loadAsPDF: this.props.loadAsPDF,
            highContrastMode: this.props.highContrastMode,
            notesInLeftPanel: this.props.notesInLeftPanel,
            selectAnnotationOnCreation: this.props.selectAnnotationOnCreation,
            enableDarkMode: this.props.enableDarkMode,
            enableFullAPI: this.props.enableFullAPI,
            customCss: this.props.customCss,
            defaultLanguage: this.props.defaultLanguage,
            l: this.props.l
        };
        return <PDFViewer {...viewerProps} />;
    }
}
