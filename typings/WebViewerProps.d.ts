/**
 * This file was generated from WebViewer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export type DefaultLanguageEnum =
    | "en"
    | "de"
    | "es"
    | "fr"
    | "it"
    | "el"
    | "ja"
    | "ko"
    | "nl"
    | "pt_br"
    | "ru"
    | "zh_cn"
    | "zh_tw"
    | "vi"
    | "uk"
    | "id"
    | "ms"
    | "bn"
    | "hi"
    | "tr";

export interface WebViewerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    fileUrl: string;
    fileAttributeUrl?: EditableValue<string>;
    fileId?: EditableValue<string>;
    enableFilePicker: boolean;
    loadAsPDF: boolean;
    enableFullAPI: boolean;
    annotationUser?: EditableValue<string>;
    enableAnnotations: boolean;
    enableMeasurement: boolean;
    enableRedaction: boolean;
    selectAnnotationOnCreation: boolean;
    isVisible?: EditableValue<boolean>;
    containerHeight: string;
    enableDarkMode: boolean;
    defaultLanguage: DefaultLanguageEnum;
    notesInLeftPanel: boolean;
    enabledElements: string;
    disabledElements: string;
    customCss: string;
    accessibleMode: boolean;
    highContrastMode: boolean;
    enableDocumentUpdates: boolean;
    l: string;
}

export interface WebViewerPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    fileUrl: string;
    fileAttributeUrl: string;
    fileId: string;
    enableFilePicker: boolean;
    loadAsPDF: boolean;
    enableFullAPI: boolean;
    annotationUser: string;
    enableAnnotations: boolean;
    enableMeasurement: boolean;
    enableRedaction: boolean;
    selectAnnotationOnCreation: boolean;
    isVisible: string;
    containerHeight: string;
    enableDarkMode: boolean;
    defaultLanguage: DefaultLanguageEnum;
    notesInLeftPanel: boolean;
    enabledElements: string;
    disabledElements: string;
    customCss: string;
    accessibleMode: boolean;
    highContrastMode: boolean;
    enableDocumentUpdates: boolean;
    l: string;
}
