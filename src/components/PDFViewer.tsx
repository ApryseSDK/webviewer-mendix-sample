import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";

export interface InputProps {
    containerHeight: string;
    file?: string;
    enableFilePicker?: boolean;
    annotationUser?: string;
    accessibleMode?: boolean;
    enableMeasurement?: boolean;
    enableRedaction?: boolean;
    enableAnnotations?: boolean;
    loadAsPDF?: boolean;
    highContrastMode?: boolean;
    notesInLeftPanel?: boolean;
    selectAnnotationOnCreation?: boolean;
    enableDarkMode?: boolean;
    enableFullAPI?: boolean;
    customCss?: string;
    defaultLanguage: string;
    l?: string;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<null | WebViewerInstance>(null);

    useEffect(() => {
        viewer(
            {
                path: "/resources/lib",
                enableFilePicker: props.enableFilePicker,
                annotationUser: props.annotationUser,
                accessibleMode: props.accessibleMode,
                enableMeasurement: props.enableMeasurement,
                enableRedaction: props.enableRedaction,
                enableAnnotations: props.enableAnnotations,
                loadAsPDF: props.loadAsPDF,
                highContrastMode: props.highContrastMode,
                notesInLeftPanel: props.notesInLeftPanel,
                selectAnnotationOnCreation: props.selectAnnotationOnCreation,
                fullAPI: props.enableFullAPI,
                css: props.customCss,
                licenseKey: props.l
            },
            viewerRef.current as HTMLDivElement
        ).then(instance => {
            const { UI } = instance;

            if (props.enableDarkMode) {
                UI.setTheme("dark");
            }

            UI.setLanguage(props.defaultLanguage);

            setInstance(instance);

            if (props.file) {
                UI.loadDocument(props.file);
            }
        });
    }, []);

    useEffect(() => {
        if (instance && props.file) {
            instance.UI.loadDocument(props.file);
        }
    }, [instance, props.file]);

    return <div className="webviewer" style={{ height: props.containerHeight }} ref={viewerRef}></div>;
};

export default PDFViewer;
