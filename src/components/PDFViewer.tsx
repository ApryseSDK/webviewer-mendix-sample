import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";
import WebViewerModuleClient from "../clients/WebViewerModuleClient";

export interface InputProps {
    containerHeight: string;
    file?: string;
    fileId?: string;
    enableFilePicker?: boolean;
    annotationUser?: string;
    accessibleMode?: boolean;
    enableMeasurement?: boolean;
    enableRedaction?: boolean;
    enableAnnotations?: boolean;
    loadAsPDF?: boolean;
    highContrastMode?: boolean;
    notesInLeftPanel?: boolean;
    enabledElements: string;
    disabledElements: string;
    selectAnnotationOnCreation?: boolean;
    enableDarkMode?: boolean;
    enableFullAPI?: boolean;
    customCss?: string;
    defaultLanguage: string;
    l?: string;
    enableDocumentUpdates?: boolean;
}

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [wvInstance, setInstance] = useState<null | WebViewerInstance>(null);

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
                disabledElements: props.disabledElements.split("\r\n"),
                selectAnnotationOnCreation: props.selectAnnotationOnCreation,
                fullAPI: props.enableFullAPI,
                css: props.customCss,
                licenseKey: props.l
            },
            viewerRef.current as HTMLDivElement
        ).then(instance => {
            const { Core, UI } = instance;

            setInstance(instance);

            UI.setLanguage(props.defaultLanguage);

            if (props.enableDarkMode) {
                UI.setTheme("dark");
            }

            if (props.enabledElements) {
                UI.enableElements(props.enabledElements.split("\r\n"));
            }

            // Check whether the backend module is available
            WebViewerModuleClient.checkForModule().then(hasWebViewerModule => {
                if (!hasWebViewerModule) {
                    return;
                }

                UI.setHeaderItems(header => {
                    if (props.enableDocumentUpdates) {
                        header.push({
                            type: "actionButton",
                            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                            onClick: async () => {
                                // Export annotation XFDF
                                const xfdfString = await Core.annotationManager.exportAnnotations({
                                    fields: true,
                                    links: true,
                                    widgets: true
                                });

                                const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                                // Send it merged with the document data to REST API to update
                                const updateTask = WebViewerModuleClient.updateFile(props.fileId || "", fileData);

                                // Add minimum artificial delay to make it look like work is being done
                                // Otherwise, requests may complete too fast
                                const uiDelay = new Promise(resolve => {
                                    setTimeout(() => {
                                        resolve(undefined);
                                    }, 3000);
                                });

                                // Show existing loading modal
                                instance.UI.openElements(["loadingModal"]);

                                // Complete when one of them finish
                                await Promise.all([uiDelay, updateTask]);

                                instance.UI.closeElements(["loadingModal"]);
                            }
                        });
                    }
                });
            });
        });
    }, [viewer]);

    useEffect(() => {
        if (wvInstance && props.file) {
            wvInstance.UI.loadDocument(props.file);
        }
    }, [wvInstance, props.file]);

    return <div className="webviewer" style={{ height: props.containerHeight }} ref={viewerRef}></div>;
};

export default PDFViewer;
