import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";

import { WebViewerContainerProps } from "../typings/WebViewerProps";

import "./ui/WebViewer.css";

export default class WebViewer extends Component<WebViewerContainerProps> {
    render(): ReactNode {
        const viewerProps = {
            containerHeight: this.props.containerHeight,
            fileUrl: this.props.fileUrl,
            fileUrlAttribute: this.props.fileUrlAttribute,
            fileIdAttribute: this.props.fileIdAttribute,
            enableFilePicker: this.props.enableFilePicker,
            annotationUser: this.props.annotationUser?.value,
            accessibleMode: this.props.accessibleMode,
            enableMeasurement: this.props.enableMeasurement,
            enableRedaction: this.props.enableRedaction,
            enableAnnotations: this.props.enableAnnotations,
            xfdfAttribute: this.props.xfdfAttribute,
            enableXfdfExportButton: this.props.enableXfdfExportButton,
            enableAutoXfdfExport: this.props.enableAutoXfdfExport,
            enableAutoXfdfImport: this.props.enableAutoXfdfImport,
            loadAsPDF: this.props.loadAsPDF,
            highContrastMode: this.props.highContrastMode,
            notesInLeftPanel: this.props.notesInLeftPanel,
            enabledElements: this.props.enabledElements,
            disabledElements: this.props.disabledElements,
            selectAnnotationOnCreation: this.props.selectAnnotationOnCreation,
            isVisible: this.props.isVisible?.value,
            enableDarkMode: this.props.enableDarkMode,
            enableFullAPI: this.props.enableFullAPI,
            customCss: this.props.customCss,
            defaultLanguage: this.props.defaultLanguage,
            l: this.props.l,
            // Module props
            enableDocumentUpdates: this.props.enableDocumentUpdates,
            enableSaveAsButton: this.props.enableSaveAsButton
        };
        return <PDFViewer {...viewerProps} />;
    }
}
