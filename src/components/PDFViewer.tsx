import React, { createElement, useRef, useEffect, useState } from "react";
import { debounce } from "lodash";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";
import WebViewerModuleClient from "../clients/WebViewerModuleClient";

export interface InputProps {
    containerHeight: string;
    fileUrl?: string;
    fileUrlAttribute?: any;
    fileIdAttribute?: any;
    enableFilePicker?: boolean;
    annotationUser?: string;
    accessibleMode?: boolean;
    enableMeasurement?: boolean;
    enableRedaction?: boolean;
    enableAnnotations?: boolean;
    xfdfAttribute?: any;
    enableXfdfExportButton: boolean;
    enableAutoXfdfExport: boolean;
    enableAutoXfdfImport: boolean;
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
    mx: any;
    enableDocumentUpdates?: boolean;
    enableSaveAsButton?: boolean;
    continueAutoXfdfImport?: boolean;
    autoXfdfImportInterval?: number;
}

const hasAttribute = (attribute: any): boolean => attribute && attribute.status === "available";

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const moduleClientRef: React.MutableRefObject<WebViewerModuleClient> = useRef(new WebViewerModuleClient(props.mx));
    const isDocumentLoadedRef: React.MutableRefObject<boolean> = useRef(false);
    const previousFileIdRef: React.MutableRefObject<any> = useRef(null);
    const currentFileIdRef: React.MutableRefObject<any> = useRef(null);
    const wvUIEventHandlers: React.MutableRefObject<any> = useRef({});
    const autoImportRef: React.MutableRefObject<any> = useRef(null);
    const previousXfdfRef: React.MutableRefObject<any> = useRef(null);
    const syncedAnnotsRef: React.MutableRefObject<any[]> = useRef([]);

    const [wvInstance, setInstance] = useState<null | WebViewerInstance>(null);

    const moduleClient = moduleClientRef.current;

    // Perform clean-up of WV when unmounted
    useEffect(() => {
        return () => {
            if (wvInstance) {
                clearInterval(autoImportRef.current);
                // Disposing WV events
                wvInstance.UI.dispose();
            }
        };
    }, [wvInstance]);

    // https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
    useEffect(() => {
        if (wvInstance && wvUIEventHandlers.current) {
            const { Core, UI } = wvInstance;

            const exportAnnotations = async (): Promise<string> => {
                if (!wvInstance) {
                    return "<xfdf />";
                }
                const { Core } = wvInstance;
                const { Annotations, annotationManager } = Core;
                const annotList = annotationManager
                    .getAnnotationsList()
                    .filter(annot => !(annot instanceof Annotations.Link && annot.isAutomaticLink()));
                const xfdfString = await Core.annotationManager.exportAnnotations({
                    annotList,
                    fields: true,
                    links: true,
                    widgets: true
                });

                return xfdfString;
            };

            wvUIEventHandlers.current.saveCurrentDocument = async () => {
                const { Core, UI } = wvInstance;
                // Send it merged with the document data to REST API to update
                if (currentFileIdRef.current || props.fileIdAttribute) {
                    // Export annotation XFDF
                    const xfdfString = await exportAnnotations();
                    previousXfdfRef.current = xfdfString;

                    const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                    await moduleClient.updateFile(
                        currentFileIdRef.current || props.fileIdAttribute.value || "",
                        fileData
                    );

                    // Add minimum artificial delay to make it look like work is being done
                    // Otherwise, requests may complete too fast
                    const uiDelay = new Promise(resolve => {
                        setTimeout(() => {
                            resolve(undefined);
                        }, 3000);
                    });

                    // Show existing loading modal
                    UI.openElements(["loadingModal"]);

                    // Complete when one of them finish
                    await Promise.all([uiDelay]);

                    UI.closeElements(["loadingModal"]);
                }
            };
            wvUIEventHandlers.current.saveAsDocument = async () => {
                // Export annotation XFDF
                const xfdfString = await exportAnnotations();
                previousXfdfRef.current = xfdfString;

                const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                const saveTask: any = moduleClient.saveFile(fileData);

                // Add minimum artificial delay to make it look like work is being done
                // Otherwise, requests may complete too fast
                const uiDelay = new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined);
                    }, 3000);
                });

                // Show existing loading modal
                UI.openElements(["loadingModal"]);

                // Complete when one of them finish
                await Promise.all([uiDelay, saveTask]);

                const currentId = await saveTask;
                previousFileIdRef.current = currentFileIdRef.current;
                currentFileIdRef.current = currentId;

                UI.closeElements(["loadingModal"]);
            };
            wvUIEventHandlers.current.updateXfdfAttribute = async (
                annotations: any[],
                _action: string,
                _info: any
            ): Promise<void> => {
                if (props.enableAutoXfdfExport && props.continueAutoXfdfImport) {
                    let isSyncUpdate = true;
                    if (annotations) {
                        for (const annot of annotations) {
                            if (!syncedAnnotsRef.current.includes(annot)) {
                                isSyncUpdate = false;
                                break;
                            }
                        }
                    }
                    if (isSyncUpdate) {
                        syncedAnnotsRef.current = [];
                        return;
                    }
                }
                const xfdfString = await exportAnnotations();
                previousXfdfRef.current = xfdfString;
                // Update Mendix XFDF Attribute
                props.xfdfAttribute.setValue(xfdfString);
            };
            if (props.enableAutoXfdfExport) {
                Core.annotationManager.removeEventListener(
                    "annotationChanged",
                    wvUIEventHandlers.current.debouncedXfdfUpdate
                );
                wvUIEventHandlers.current.debouncedXfdfUpdate = debounce(
                    wvUIEventHandlers.current.updateXfdfAttribute,
                    1000
                );
                Core.annotationManager.addEventListener(
                    "annotationChanged",
                    wvUIEventHandlers.current.debouncedXfdfUpdate
                );
            }
            wvUIEventHandlers.current.autoImportXfdf = async (): Promise<void> => {
                if (!wvInstance) {
                    return;
                }
                const doc = wvInstance.Core.documentViewer.getDocument();
                if (!doc) {
                    return;
                }
                await doc.getDocumentCompletePromise();
                moduleClient
                    .getFileInfo(currentFileIdRef.current || props.fileIdAttribute.value || "")
                    .then(async (fileInfo: any) => {
                        if (fileInfo.xfdf) {
                            if (fileInfo.xfdf === previousXfdfRef.current) {
                                return;
                            }
                            // XFDF doesn't show what has been deleted
                            const regex = /name="([a-zA-Z0-9-]+)"/gim;
                            const incomingAnnots = [];
                            let result;
                            while ((result = regex.exec(fileInfo.xfdf))) {
                                incomingAnnots.push(result[1]);
                            }
                            const annotList = [...Core.annotationManager.getAnnotationsList()];
                            if (incomingAnnots.length > 0) {
                                for (const id of incomingAnnots) {
                                    const idIndex = annotList.findIndex(annot => annot.Id === id);
                                    if (idIndex >= 0) {
                                        annotList.splice(idIndex, 1);
                                    }
                                }
                            }
                            Core.annotationManager.deleteAnnotations(annotList, { source: "sync" });
                            const importedAnnots = await Core.annotationManager.importAnnotations(fileInfo.xfdf);
                            syncedAnnotsRef.current = importedAnnots;
                            previousXfdfRef.current = fileInfo.xfdf;
                        }
                    })
                    .catch(e => {
                        console.error("Error while importing annotation changes", e);
                        clearInterval(autoImportRef.current);
                    });
            };
        }
    }, [
        wvInstance,
        moduleClient,
        props.enableAutoXfdfExport,
        props.fileIdAttribute,
        props.xfdfAttribute,
        props.continueAutoXfdfImport
    ]);

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
            } else {
                UI.setTheme("light");
            }

            if (props.enabledElements) {
                UI.enableElements(props.enabledElements.split("\r\n"));
            }

            // Check whether the backend module is available
            moduleClient.checkForModule().then(hasWebViewerModule => {
                if (!hasWebViewerModule) {
                    return;
                }

                UI.setHeaderItems((header: any) => {
                    if (props.enableDocumentUpdates) {
                        header.push({
                            type: "actionButton",
                            title: "Save document",
                            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                            onClick: async () => wvUIEventHandlers.current.saveCurrentDocument()
                        });
                    }

                    if (props.enableSaveAsButton) {
                        header.push({
                            type: "actionButton",
                            title: "Save As",
                            img: `<svg width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.3439 12.2929C20.9534 11.9024 20.3202 11.9024 19.9297 12.2929L18.9611 13.2615L20.6786 14.979L21.6472 14.0104C22.0377 13.6199 22.0377 12.9867 21.6472 12.5962L21.3439 12.2929Z" fill="black"/>
                            <path d="M19.5615 16.0961L17.844 14.3786L12.2584 19.9642L12 21.9401L13.9759 21.6817L19.5615 16.0961Z" fill="black"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.05087 21H4C2.897 21 2 20.103 2 19V5C2 3.897 2.897 3 4 3H15C15.266 3 15.52 3.105 15.707 3.293L19.707 7.293C19.895 7.48 20 7.735 20 8V10.0509L18.0003 12.0505L18 8.414L14.586 5H14V9H13H12H10H8H6V5H4V19H6V14C6 12.897 6.897 12 8 12H14C15.103 12 16 12.897 16 14V14.0509L14 16.0509V14H8V19H11.0509L9.05087 21ZM10 7H12V5H10V7Z" fill="black"/>
                            </svg>`,
                            onClick: async () => wvUIEventHandlers.current.saveAsDocument()
                        });
                    }
                });

                // Manual and auto XFDF export
                if (hasAttribute(props.xfdfAttribute)) {
                    if (props.xfdfAttribute.readOnly) {
                        console.warn(
                            "The XFDF attribute is read-only. Please check the user permissions or allow the data source to be editable."
                        );
                        return;
                    }

                    if (props.enableXfdfExportButton) {
                        UI.setHeaderItems((header: any) => {
                            header.push({
                                type: "actionButton",
                                title: "Save XFDF",
                                img: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5 C21,3.9,20.1,3,19,3z M12,2.75c0.41,0,0.75,0.34,0.75,0.75S12.41,4.25,12,4.25s-0.75-0.34-0.75-0.75S11.59,2.75,12,2.75z M19,19H5 V5h14V19z"/><polygon points="15.08,11.03 12.96,8.91 7,14.86 7,17 9.1,17"/><path d="M16.85,9.27c0.2-0.2,0.2-0.51,0-0.71l-1.41-1.41c-0.2-0.2-0.51-0.2-0.71,0l-1.06,1.06l2.12,2.12L16.85,9.27z"/></g></g></svg>`,
                                onClick: () => wvUIEventHandlers.current.updateXfdfAttribute()
                            });
                        });
                    }
                }

                // Continue auto XFDF import after initial
                if (
                    props.continueAutoXfdfImport &&
                    hasAttribute(props.fileIdAttribute) &&
                    hasAttribute(props.xfdfAttribute)
                ) {
                    if (autoImportRef.current) {
                        clearInterval(autoImportRef.current);
                    }
                    autoImportRef.current = setInterval(() => {
                        wvUIEventHandlers.current.autoImportXfdf();
                    }, props.autoXfdfImportInterval || 1000);
                }
            });

            Core.documentViewer.addEventListener("documentLoaded", () => {
                isDocumentLoadedRef.current = true;
                if (hasAttribute(props.fileIdAttribute)) {
                    currentFileIdRef.current = props.fileIdAttribute?.value;
                }
            });

            Core.documentViewer.addEventListener("documentUnloaded", () => {
                isDocumentLoadedRef.current = false;
                previousFileIdRef.current = currentFileIdRef.current;
                currentFileIdRef.current = null;
            });

            Core.documentViewer.setDocumentXFDFRetriever(async () => {
                // Only auto import when we are loading from a file entity
                if (currentFileIdRef.current && props.enableAutoXfdfImport && hasAttribute(props.xfdfAttribute)) {
                    previousXfdfRef.current = props.xfdfAttribute.value;
                    return props.xfdfAttribute.value;
                }
            });
        });
    }, [viewer]);

    // Attributes in Mendix may update later, this will load the file after the update
    useEffect(() => {
        // Load from attribute over plain string
        if (wvInstance) {
            if (hasAttribute(props.fileUrlAttribute)) {
                wvInstance.UI.loadDocument(props.fileUrlAttribute.value);
            } else if (props.fileUrl && !props.fileUrlAttribute) {
                previousFileIdRef.current = currentFileIdRef.current;
                currentFileIdRef.current = null;
                wvInstance.UI.loadDocument(props.fileUrl);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wvInstance, props.fileUrl]); // Ignore file URL attribute or it will cause the file to reload

    useEffect(() => {
        // Set file ID for saving back to Mendix when ready
        if (wvInstance && hasAttribute(props.fileIdAttribute)) {
            previousFileIdRef.current = currentFileIdRef.current;
            currentFileIdRef.current = props.fileIdAttribute.value;
        }
    }, [wvInstance, props.fileIdAttribute]);

    useEffect(() => {
        // Setting the annotation user in WV
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
