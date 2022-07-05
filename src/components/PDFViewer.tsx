import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";

export interface InputProps {
    file?: string;
    l?: string;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<null | WebViewerInstance>(null);

    useEffect(() => {
        viewer(
            {
                path: "/resources/lib",
                licenseKey: props.l
            },
            viewerRef.current as HTMLDivElement
        ).then(instance => {
            const { UI } = instance;

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

    return <div className="webviewer" ref={viewerRef}></div>;
};

export default PDFViewer;
