import React, { createElement } from "react";
import ListItem from "./ListItem";

interface VirtualListInputProps {
    items: any[];
    numItems: number;
    render: any;
    height: string | number;
    itemStyle?: any;
    itemHoverStyle?: any;
}

class VirtualList extends React.Component<VirtualListInputProps> {
    private scrollContainerRef: React.RefObject<HTMLDivElement>;
    constructor(props: VirtualListInputProps) {
        super(props);
        this.scrollContainerRef = React.createRef();
    }
    render(): JSX.Element {
        const { itemStyle, itemHoverStyle } = this.props;
        return (
            <div
                ref={this.scrollContainerRef}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "1fr",
                    width: "100%",
                    overflow: "auto",
                    height: this.props.height
                }}
            >
                {this.props.items.map((item, i) => (
                    <ListItem
                        key={i}
                        item={item}
                        render={this.props.render}
                        isVisible
                        ref={undefined}
                        style={itemStyle}
                        hoverStyle={itemHoverStyle}
                    />
                ))}
            </div>
        );
    }
}

export default VirtualList;
