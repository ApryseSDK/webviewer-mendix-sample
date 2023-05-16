import React, { createElement } from "react";
import type { WebViewerInstance } from "@pdftron/webviewer";

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
        const { thumbnailCache } = this.state;
        this.state.wvInstance.Core.documentViewer.getDocument().loadThumbnail(pageNumber, (thumbnail: any) => {
            this.setState({
                thumbnailCache: {
                    ...thumbnailCache,
                    [pageNumber]: thumbnail.toDataURL()
                }
            });
        });
    };
    render(): JSX.Element {
        const { currentPage, pageCount, thumbnailCache } = this.state;
        return (
            <div className="Modal WarningModal">
                <div className="container">
                    <div className="header">Page Extraction</div>
                    <div className="body" style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                        <div>
                            <div>
                                <img src={thumbnailCache[currentPage]} />
                            </div>
                            <div>{`${currentPage}/${pageCount}`}</div>
                        </div>
                        <div>
                            <span>Pages:</span>
                            <input type="text" style={{ height: "28px", marginTop: "10px" }} />
                        </div>
                    </div>
                    <div className="footer">
                        <div className="Button cancel modal-button">Download</div>
                        <div className="Button modal-button">Save to Mendix</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PageExtractionModal;
