import { createElement, useRef, useEffect, useState } from "react";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";
import WebViewerModuleClient from "../clients/WebViewerModuleClient";

export interface InputProps {
    containerHeight: string;
    fileUrl?: string;
    fileId?: string;
    enableFilePicker?: boolean;
    annotationUser?: string;
    accessibleMode?: boolean;
    enableMeasurement?: boolean;
    enableRedaction?: boolean;
    enableAnnotations?: boolean;
    xfdfAttribute?: any;
    enableXfdfExportButton: boolean;
    enableAutoXfdfExport: boolean;
    loadAsPDF?: boolean;
    highContrastMode?: boolean;
    notesInLeftPanel?: boolean;
    enabledElements: string;
    disabledElements: string;
    selectAnnotationOnCreation?: boolean;
    isVisible?: boolean;
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

    let documentLoadCount = 0;
    let currentFileId: string | null | undefined | void = null;

    // Perform clean-up of WV when unmounted
    useEffect(() => {
        return () => {
            if (wvInstance) {
                // Disposing WV events
                wvInstance.UI.dispose();
            }
        };
    }, [wvInstance]);

    // Mount WV only once
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
        ).then((instance: WebViewerInstance) => {
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
                            title: "Save document",
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
                                const updateTask = currentFileId
                                    ? WebViewerModuleClient.updateFile(props.fileId || "", fileData)
                                    : WebViewerModuleClient.saveFile(fileData);

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

                                if (!currentFileId) {
                                    const currentId = await updateTask;
                                    currentFileId = currentId;
                                }

                                instance.UI.closeElements(["loadingModal"]);
                            }
                        });
                    }
                });

                if (props.xfdfAttribute) {
                    if (props.xfdfAttribute.readOnly && (props.enableXfdfExportButton || props.enableAutoXfdfExport)) {
                        console.warn(
                            "The XFDF attribute is read-only. Please check the user permissions or allow the data source to be editable."
                        );
                    } else {
                        const updateXfdfAttribute = async (): Promise<void> => {
                            const doc = Core.documentViewer.getDocument();
                            if (!doc) {
                                return;
                            }

                            const xfdfString = await Core.annotationManager.exportAnnotations();
                            props.xfdfAttribute.setValue(xfdfString);
                        };

                        if (props.enableXfdfExportButton) {
                            UI.setHeaderItems(header => {
                                header.push({
                                    type: "actionButton",
                                    title: "Save XFDF",
                                    img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                                    onClick: updateXfdfAttribute
                                });
                            });
                        }

                        if (props.enableAutoXfdfExport) {
                            Core.annotationManager.addEventListener("annotationsChanged", updateXfdfAttribute);
                        }
                    }
                }
            });

            Core.documentViewer.addEventListener("documentLoaded", () => {
                documentLoadCount++;
                if (documentLoadCount > 1 && currentFileId) {
                    currentFileId = null;
                } else {
                    currentFileId = props.fileId;
                }
            });
        });
    }, [viewer]);

    // Attributes in Mendix may update later, this will load the file after the update
    useEffect(() => {
        if (wvInstance && props.fileUrl) {
            wvInstance.UI.loadDocument(props.fileUrl);
        }
    }, [wvInstance, props.fileUrl]);

    // Attributes in Mendix may update later, this will load the file after the update
    useEffect(() => {
        if (wvInstance && props.annotationUser) {
            wvInstance.Core.annotationManager.setCurrentUser(props.annotationUser);
        }
    }, [wvInstance, props.annotationUser]);

    return (
        <div
            className="webviewer"
            style={{
                height: props.containerHeight,
                visibility:
                    props.isVisible || props.isVisible === undefined || props.isVisible === null ? "visible" : "hidden"
            }}
            ref={viewerRef}
        ></div>
    );
};

export default PDFViewer;
