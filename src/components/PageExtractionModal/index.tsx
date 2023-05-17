import React, { createElement } from "react";
import type { WebViewerInstance } from "@pdftron/webviewer";
import VirtualList from "./VirtualList";
import PageExtractionThumbnail from "./PageExtractionThumbnail";

interface PageExtractionModalInputProps {
    wvInstance: WebViewerInstance;
}

class PageExtractionModal extends React.Component<PageExtractionModalInputProps> {
    renderThumbnail = (pageNumber: number) => {
        return <PageExtractionThumbnail wvInstance={this.props.wvInstance} pageNumber={pageNumber} />;
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
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between"
                        }}
                    >
                        <VirtualList
                            height="400px"
                            numItems={7}
                            render={this.renderThumbnail}
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
