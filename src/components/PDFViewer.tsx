import React, { createElement, ReactNode } from "react";
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
    enableDocumentUpdates?: boolean;
    enableSaveAsButton?: boolean;
}

export interface ViewerState {
    wvInstance?: WebViewerInstance;
    isDocumentLoaded: boolean;
    currentFileId?: number;
}

const hasAttribute = (attribute: any): boolean => attribute && attribute.status === "available";

class PDFViewer extends React.Component<InputProps, ViewerState> {
    viewerRef: React.RefObject<HTMLDivElement>;
    constructor(props: InputProps) {
        super(props);
        this.viewerRef = React.createRef();
        this.state = {
            wvInstance: undefined,
            isDocumentLoaded: false,
            currentFileId: undefined
        };
    }
    componentDidMount(): void {
        viewer(
            {
                path: "/resources/lib",
                enableFilePicker: this.props.enableFilePicker,
                annotationUser: this.props.annotationUser,
                accessibleMode: this.props.accessibleMode,
                enableMeasurement: this.props.enableMeasurement,
                enableRedaction: this.props.enableRedaction,
                enableAnnotations: this.props.enableAnnotations,
                loadAsPDF: this.props.loadAsPDF,
                highContrastMode: this.props.highContrastMode,
                notesInLeftPanel: this.props.notesInLeftPanel,
                disabledElements: this.props.disabledElements.split("\r\n"),
                selectAnnotationOnCreation: this.props.selectAnnotationOnCreation,
                fullAPI: this.props.enableFullAPI,
                css: this.props.customCss,
                licenseKey: this.props.l
            },
            this.viewerRef.current as HTMLDivElement
        ).then((instance: WebViewerInstance) => {
            const { Core, UI } = instance;

            this.setState({ wvInstance: instance });

            UI.setLanguage(this.props.defaultLanguage);

            if (this.props.enableDarkMode) {
                UI.setTheme("dark");
            }

            if (this.props.enabledElements) {
                UI.enableElements(this.props.enabledElements.split("\r\n"));
            }

            // Check whether the backend module is available
            WebViewerModuleClient.checkForModule().then(hasWebViewerModule => {
                if (!hasWebViewerModule) {
                    return;
                }

                UI.setHeaderItems((header: any) => {
                    if (this.props.enableDocumentUpdates) {
                        header.push({
                            type: "actionButton",
                            title: "Save document",
                            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                            onClick: async () => {
                                // Send it merged with the document data to REST API to update
                                if (this.state.currentFileId || this.props.fileIdAttribute) {
                                    // Export annotation XFDF
                                    const xfdfString = await Core.annotationManager.exportAnnotations({
                                        fields: true,
                                        links: true,
                                        widgets: true
                                    });

                                    const fileData = await Core.documentViewer
                                        .getDocument()
                                        .getFileData({ xfdfString });

                                    await WebViewerModuleClient.updateFile(
                                        this.state.currentFileId || this.props.fileIdAttribute.value || "",
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
                            }
                        });
                    }

                    if (this.props.enableSaveAsButton) {
                        header.push({
                            type: "actionButton",
                            title: "Save As",
                            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                            onClick: async () => {
                                // Export annotation XFDF
                                const xfdfString = await Core.annotationManager.exportAnnotations({
                                    fields: true,
                                    links: true,
                                    widgets: true
                                });

                                const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                                const saveTask: any = WebViewerModuleClient.saveFile(fileData);

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
                                this.setState({ currentFileId: Number(currentId) });

                                UI.closeElements(["loadingModal"]);
                            }
                        });
                    }
                });
            });

            Core.documentViewer.addEventListener("documentLoaded", () => this.setState({ isDocumentLoaded: true }));
            Core.documentViewer.addEventListener("documentUnloaded", () => this.setState({ isDocumentLoaded: false }));

            if (this.props.annotationUser) {
                Core.annotationManager.setCurrentUser(this.props.annotationUser);
            }

            // Loading from attribute takes priority
            if (hasAttribute(this.props.fileUrlAttribute)) {
                UI.loadDocument(this.props.fileUrlAttribute.value);
            } else if (this.props.fileUrl && !this.props.fileUrlAttribute) {
                UI.loadDocument(this.props.fileUrl);
            }

            if (hasAttribute(this.props.fileIdAttribute)) {
                this.setState({ currentFileId: this.props.fileIdAttribute.value });
            }

            if (hasAttribute(this.props.xfdfAttribute)) {
                if (this.props.xfdfAttribute.readOnly) {
                    console.warn(
                        "The XFDF attribute is read-only. Please check the user permissions or allow the data source to be editable."
                    );
                } else {
                    const updateXfdfAttribute = async (
                        _annotations: Event | any[],
                        _action: string,
                        info: any
                    ): Promise<void> => {
                        // Skip import events
                        if (info && info.imported) {
                            return;
                        }
                        const doc = Core.documentViewer.getDocument();
                        if (!doc) {
                            return;
                        }

                        const xfdfString = await Core.annotationManager.exportAnnotations();
                        this.props.xfdfAttribute.setValue(xfdfString);
                    };

                    const debouncedXfdfUpdate = debounce(updateXfdfAttribute, 1000);

                    if (this.props.enableXfdfExportButton) {
                        UI.setHeaderItems((header: any) => {
                            header.push({
                                type: "actionButton",
                                title: "Save XFDF",
                                img: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5 C21,3.9,20.1,3,19,3z M12,2.75c0.41,0,0.75,0.34,0.75,0.75S12.41,4.25,12,4.25s-0.75-0.34-0.75-0.75S11.59,2.75,12,2.75z M19,19H5 V5h14V19z"/><polygon points="15.08,11.03 12.96,8.91 7,14.86 7,17 9.1,17"/><path d="M16.85,9.27c0.2-0.2,0.2-0.51,0-0.71l-1.41-1.41c-0.2-0.2-0.51-0.2-0.71,0l-1.06,1.06l2.12,2.12L16.85,9.27z"/></g></g></svg>`,
                                onClick: updateXfdfAttribute
                            });
                        });
                    }

                    if (this.props.enableAutoXfdfExport) {
                        Core.annotationManager.addEventListener("annotationChanged", debouncedXfdfUpdate);
                    }
                }
            }

            if (this.props.enableAutoXfdfImport && this.state.currentFileId) {
                if (!this.props.xfdfAttribute) {
                    console.warn("There was no XFDF attribute provided to the WebViewer component.");
                } else if (hasAttribute(this.props.xfdfAttribute)) {
                    if (this.state.isDocumentLoaded) {
                        Core.annotationManager.importAnnotations(this.props.xfdfAttribute.value);
                    } else {
                        Core.documentViewer.setDocumentXFDFRetriever(async () => {
                            // Only auto import when we are loading from a file entity
                            if (this.state.currentFileId && this.props.enableAutoXfdfImport) {
                                return this.props.xfdfAttribute.value;
                            }
                        });
                    }
                }
            }
        });
    }
    componentWillUnmount(): void {
        // Perform clean-up of WV when unmounted
        if (this.state.wvInstance) {
            // Disposing WV events
            this.state.wvInstance.UI.dispose();
            this.setState({ wvInstance: undefined });
        }
    }
    render(): ReactNode {
        return (
            <div
                className="webviewer"
                style={{
                    height: this.props.containerHeight,
                    visibility:
                        this.props.isVisible || this.props.isVisible === undefined || this.props.isVisible === null
                            ? "visible"
                            : "hidden"
                }}
                ref={this.viewerRef}
            ></div>
        );
    }
}

export default PDFViewer;
