import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";

export interface InputProps {
    value: string;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<null | WebViewerInstance>(null);

    useEffect(() => {
        viewer(
            {
                path: "/resources/lib",
                initialDoc: "https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf"
            },
            viewerRef.current as HTMLDivElement
        ).then(instance => {
            setInstance(instance);
        });
    }, []);

    useEffect(() => {
        if (instance && props.value !== "") {
            instance.loadDocument(props.value);
        }
    }, [props.value]);

    return <div className="webviewer" ref={viewerRef}></div>;
};

export default PDFViewer;
