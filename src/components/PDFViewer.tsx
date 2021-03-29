import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";
// @ts-ignore
import { initialize3dViewer } from "@pdftron/webviewer-3d";


export interface InputProps {
    value: string;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<null | WebViewerInstance>(null);

    useEffect(() => {
        viewer(
            {
                path: "/resources/lib"
            },
            viewerRef.current as HTMLDivElement
        ).then(async instance => {
            instance.setTheme("dark");
            setInstance(instance);
            
            const license = `---- Insert commercial license key here after purchase ----`;

            const { loadModel } = await initialize3dViewer(instance, { license });
            loadModel('/car/scene.gltf');
            
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
