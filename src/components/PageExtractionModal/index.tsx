import React, { createElement } from "react";
import type { WebViewerInstance } from "@pdftron/webviewer";
import VirtualList from "./VirtualList";

interface PageExtractionModalInputProps {
    wvInstance: WebViewerInstance;
}

interface PageExtractionModalState {
    wvInstance: WebViewerInstance;
    pageCount: number;
    currentPage: number;
    thumbnailCache: Record<number, string>;
}

class PageExtractionModal extends React.Component<PageExtractionModalInputProps, PageExtractionModalState> {
    constructor(props: PageExtractionModalInputProps) {
        super(props);
        const doc = this.props.wvInstance.Core.documentViewer.getDocument();
        this.state = {
            wvInstance: props.wvInstance,
            pageCount: doc ? doc.getPageCount() : 0,
            currentPage: 1,
            thumbnailCache: {}
        };
        this.loadThumbnail(1);
    }
    componentDidMount(): void {
        this.state.wvInstance.Core.documentViewer.addEventListener("documentLoaded", this.onDocumentLoaded);
    }
    componentWillUnmount(): void {
        this.state.wvInstance.Core.documentViewer.removeEventListener("documentLoaded", this.onDocumentLoaded);
    }
    componentDidUpdate(
        _prevProps: Readonly<PageExtractionModalInputProps>,
        prevState: Readonly<PageExtractionModalState>,
        _snapshot?: any
    ): void {
        if (prevState.currentPage !== this.state.currentPage && !this.state.thumbnailCache[this.state.currentPage]) {
            this.loadThumbnail(this.state.currentPage);
        }
    }
    onDocumentLoaded = () => {
        this.setState({
            pageCount: this.state.wvInstance.Core.documentViewer.getDocument().getPageCount()
        });
    };
    loadThumbnail = (pageNumber: number) => {
        return new Promise(res => {
            this.state.wvInstance.Core.documentViewer.getDocument().loadThumbnail(pageNumber, (thumbnail: any) => {
                res(
                    <div style={{ display: "inline-block", boxShadow: "1px 1px 5px black", position: "relative" }}>
                        <img src={thumbnail.toDataURL()} />
                        <input type="checkbox" style={{ position: "absolute", top: 0, left: 0 }} />
                    </div>
                );
            });
        });
    };
    render(): JSX.Element {
        // const { currentPage, pageCount } = this.state;
        return (
            <div className="Modal WarningModal">
                <div className="container">
                    <div className="header">Page Extraction</div>
                    <div
                        className="body"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between"
                        }}
                    >
                        <VirtualList
                            height="400px"
                            numItems={7}
                            render={this.loadThumbnail}
                            items={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                        />
                        <div style={{ margin: "1em" }}>
                            <span>Pages:</span>
                            <input type="text" style={{ height: "28px", marginTop: "10px" }} />
                        </div>
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
