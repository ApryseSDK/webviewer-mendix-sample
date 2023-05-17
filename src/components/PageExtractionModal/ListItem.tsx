import React, { createElement } from "react";

interface ListItemInputProps {
    ref: any;
    item: any;
    render: any;
    isVisible: boolean;
    style?: any;
    hoverStyle?: any;
}

interface ListItemState {
    renderTarget: any;
    shouldRenderItem: boolean;
    isHover: boolean;
}

class ListItem extends React.Component<ListItemInputProps, ListItemState> {
    constructor(props: ListItemInputProps) {
        super(props);
        const renderTarget = this.props.render(this.props.item);
        const isPromise = renderTarget instanceof Promise;
        if (isPromise) {
            renderTarget.then((result: any) => this.setState({ renderTarget: result, shouldRenderItem: true }));
        }
        this.state = {
            renderTarget: isPromise ? undefined : renderTarget,
            shouldRenderItem: !isPromise,
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
        if (!this.props.isVisible || !this.state.shouldRenderItem) {
            return <></>;
        }
        const listItemStyle = this.state.isHover ? this.props.hoverStyle : this.props.style;
        return (
            <div
                ref={this.props.ref}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0.5em 0px" }}
            >
                {React.cloneElement(this.state.renderTarget, {
                    style: listItemStyle,
                    onMouseEnter: this.onHoverEnter,
                    onMouseLeave: this.onHoverLeave
                })}
            </div>
        );
    }
}

export default ListItem;
