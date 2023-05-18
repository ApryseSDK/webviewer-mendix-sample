import React, { createElement } from "react";
import type { WebViewerInstance } from "@pdftron/webviewer";
import VirtualList from "./VirtualList";
import PageExtractionThumbnail from "./PageExtractionThumbnail";

interface PageExtractionModalInputProps {
    wvInstance: WebViewerInstance;
}

interface PageExtractionModalState {
    pageInput: string;
}

class PageExtractionModal extends React.Component<PageExtractionModalInputProps, PageExtractionModalState> {
    private _timeoutHandle: any;
    private _thumbnailSubscriptions: any;
    constructor(props: PageExtractionModalInputProps) {
        super(props);
        this._thumbnailSubscriptions = {};
        this.state = {
            pageInput: "1"
        };
    }
    onPageInputChanged = (e: any) => {
        this.setState({
            pageInput: e.target.value || "1"
        });
        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle);
        }
        this._timeoutHandle = setTimeout(() => {
            const parsedInput = this.parsePageInputString(this.state.pageInput);
            this.setState({ pageInput: parsedInput });
            this.trigger(parsedInput);
        }, 1000);
    };
    parsePageInputString = (input: string) => {
        if (!input) {
            return "1";
        }
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        const parts = input.split(",").map(input => input.replace(/[a-zA-Z]+/, "").trim());
        const sanitizedParts = parts.reduce((acc: string[], part: string | undefined | null): string[] => {
            if (!part || part.startsWith("-")) {
                return acc;
            }
            const rangeParts = part.split("-").sort();
            let finalPart = part;
            const isRange = rangeParts.length === 2;
            if (isRange) {
                let lower = rangeParts[0];
                let upper = rangeParts[1];
                if (lower > upper) {
                    const temp = lower;
                    lower = upper;
                    upper = temp;
                    finalPart = `${lower}-${upper}`;
                } else if (lower === upper) {
                    finalPart = lower;
                }
                if (Number(lower) > numPages || Number(lower) < 1 || Number(upper) > numPages || Number(upper) < 1) {
                    return acc;
                }
            } else {
                if (Number(rangeParts[0]) > numPages || Number(rangeParts[0]) < 1) {
                    return acc;
                }
                finalPart = rangeParts[0];
            }
            acc.push(finalPart);
            return acc;
        }, []);

        return sanitizedParts.join(",");
    };
    subscribe = (pageNumber: number, handler: any) => {
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        if (!pageNumber || pageNumber > numPages || !handler) {
            return;
        }
        if (!this._thumbnailSubscriptions[pageNumber]) {
            this._thumbnailSubscriptions[pageNumber] = [];
        }
        this._thumbnailSubscriptions[pageNumber].push(handler);
    };
    unsubscribe = (pageNumber: number, handler: any) => {
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        if (!pageNumber || pageNumber > numPages || !handler) {
            return;
        }
        this._thumbnailSubscriptions[pageNumber] = this._thumbnailSubscriptions[pageNumber].reduce(
            (acc: any[], registeredHandler: any) => {
                if (registeredHandler !== handler) {
                    acc.push(registeredHandler);
                }
                return acc;
            },
            []
        );
    };
    trigger = (input: string) => {
        Object.values(this._thumbnailSubscriptions).forEach((handlers: any[]) =>
            handlers.forEach(handler => handler(input))
        );
    };
    loadThumbnail = (pageNumber: number) => {
        return (
            <PageExtractionThumbnail
                wvInstance={this.props.wvInstance}
                pageNumber={pageNumber}
                addFileInputEventListener={this.subscribe}
                removeFileInputEventListener={this.unsubscribe}
            />
        );
    };
    render(): JSX.Element {
        return (
            <div className="Modal WarningModal">
                <div className="container">
                    <div className="header">Page Extraction</div>
                    <div
                        className="body"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ margin: "1em" }}>
                            <span>Pages: </span>
                            <input
                                type="text"
                                style={{ height: "28px" }}
                                defaultValue={this.state.pageInput}
                                value={this.state.pageInput}
                                onChange={this.onPageInputChanged}
                            />
                        </div>
                        <VirtualList
                            height="400px"
                            numItems={7}
                            render={this.loadThumbnail}
                            items={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                        />
                    </div>
                    <div className="footer">
                        <div className="Button cancel modal-button">Cancel</div>
                        <div className="Button modal-button">Download</div>
                        <div className="Button modal-button">Save to Mendix</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PageExtractionModal;
