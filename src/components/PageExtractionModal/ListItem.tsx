import React, { createElement } from "react";

interface ListItemInputProps {
    item: any;
    render: any;
    parentAddEventListener: any;
    parentRemoveEventListener: any;
}

interface ListItemState {
    renderTarget: any;
    shouldRenderItem: boolean;
    isVisible: boolean;
}

class ListItem extends React.Component<ListItemInputProps, ListItemState> {
    private static MAX_SIZE = 0;
    private _containerRef: React.RefObject<HTMLDivElement>;
    private _measurementRef: React.RefObject<HTMLDivElement>;
    private _resizeObserver: ResizeObserver;
    private _height = 0;
    private _scrollHandle: any;
    constructor(props: ListItemInputProps) {
        super(props);
        this._containerRef = React.createRef();
        this._measurementRef = React.createRef();
        this._resizeObserver = new ResizeObserver(() => {
            const rect = this._measurementRef.current?.getBoundingClientRect();
            if (!rect || rect.height === 0 || (this._height && rect.height < this._height)) {
                return;
            }
            this._height = rect.height;
            if (this._height > ListItem.MAX_SIZE) {
                ListItem.MAX_SIZE = this._height;
            }
        });
        this.props.parentAddEventListener("scroll", this.onParentScroll);
        const renderTarget = this.props.render(this.props.item);
        const isPromise = renderTarget instanceof Promise;
        if (isPromise) {
            renderTarget.then((result: any) => this.setState({ renderTarget: result, shouldRenderItem: true }));
        }
        this.state = {
            renderTarget: isPromise ? undefined : renderTarget,
            shouldRenderItem: !isPromise,
            isVisible: true
        };
    }
    componentDidMount(): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._resizeObserver.observe(this._measurementRef.current);
    }
    componentWillUnmount(): void {
        if (this._measurementRef.current) {
            this._resizeObserver.unobserve(this._measurementRef.current);
        }
        this.props.parentRemoveEventListener("scroll", this.onParentScroll);
    }
    onParentScroll = (parentRect: any, _scrollTop: number, padding: number): void => {
        clearTimeout(this._scrollHandle);
        this._scrollHandle = setTimeout(() => {
            const rect = this._containerRef.current?.getBoundingClientRect();
            if (this.doRectanglesIntersect(parentRect, rect, padding)) {
                this.setState({ isVisible: true });
            } else {
                this.setState({ isVisible: false });
            }
        }, 100);
    };
    doRectanglesIntersect = (rect1: any, rect2: any, padding = 13): boolean => {
        const itemPadding = ListItem.MAX_SIZE * padding;
        const rect1Top = rect1.y - itemPadding;
        const rect1Bottom = rect1.y + rect1.height + itemPadding;
        const rect2Top = rect2.y;
        const rect2Bottom = rect2.y + rect2.height;

        const verticalIntersection = rect1Top < rect2Bottom && rect1Bottom > rect2Top;

        return verticalIntersection;
    };
    // eslint-disable-next-line no-undef
    render(): JSX.Element {
        if (!this.state.shouldRenderItem) {
            return <></>;
        }
        return (
            <div
                ref={this._containerRef}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.5em 0px"
                    // DEBUGGING ONLY
                    // backgroundColor: this.state.isVisible ? "green" : "red"
                }}
            >
                <div ref={this._measurementRef}>
                    {this.state.isVisible ? (
                        this.state.renderTarget
                    ) : (
                        <div
                            style={{
                                height: `${ListItem.MAX_SIZE < this._height ? this._height : ListItem.MAX_SIZE}px`
                            }}
                        ></div>
                    )}
                </div>
            </div>
        );
    }
}

export default ListItem;
