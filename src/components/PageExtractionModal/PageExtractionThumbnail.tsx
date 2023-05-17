import React, { createElement } from "react";

interface PageExtractionThumbnailInputProps {
    wvInstance: any;
    pageNumber: number;
}

interface PageExtractionThumbnailState {
    thumbnail?: string;
    isHover: boolean;
}

const ListItemStyle = { display: "inline-block", boxShadow: "1px 1px 8px black", position: "relative" };
const ListItemHoverStyle = { ...ListItemStyle, boxShadow: "1px 1px 5px #3183c8" };

class PageExtractionThumbnail extends React.Component<PageExtractionThumbnailInputProps, PageExtractionThumbnailState> {
    constructor(props: PageExtractionThumbnailInputProps) {
        super(props);
        this.props.wvInstance.Core.documentViewer
            .getDocument()
            .loadThumbnail(this.props.pageNumber, (thumbnailCanvas: HTMLCanvasElement) => {
                this.setState({
                    thumbnail: thumbnailCanvas.toDataURL()
                });
            });
        this.state = {
            thumbnail: undefined,
            isHover: false
        };
    }
    onHoverEnter = () => {
        this.setState({
            isHover: true
        });
    };
    onHoverLeave = () => {
        this.setState({
            isHover: false
        });
    };
    render(): JSX.Element {
        const { thumbnail, isHover } = this.state;
        const listItemStyle = isHover ? ListItemHoverStyle : ListItemStyle;
        return (
            // @ts-ignore
            <div style={listItemStyle} onMouseEnter={this.onHoverEnter} onMouseLeave={this.onHoverLeave}>
                <img src={thumbnail} />
                <input type="checkbox" style={{ position: "absolute", top: 0, left: 0 }} />
            </div>
        );
    }
}

export default PageExtractionThumbnail;
