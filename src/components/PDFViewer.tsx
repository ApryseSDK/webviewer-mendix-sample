import { createElement, useRef, useEffect } from "react";
import viewer from "@pdftron/webviewer";

export interface InputProps {
    value: string;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    console.log(props);

    useEffect(() => {
        viewer(
            {
                path: "/resources/lib",
                initialDoc: "https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf"
            },
            viewerRef.current as HTMLDivElement
        ).then(instance => {
            console.log(instance);
        });
    }, []);

    return <div className="webviewer" ref={viewerRef}></div>;
};

export default PDFViewer;
