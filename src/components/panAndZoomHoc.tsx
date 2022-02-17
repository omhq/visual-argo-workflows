import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export interface PanAndZoomHOCProps {
    x?: number;
    y?: number;
    scale?: number;
    scaleFactor?: number;
    minScale?: number;
    maxScale?: number;
    renderOnChange?: boolean;
    passOnProps?: boolean;
    ignorePanOutside?: boolean;
    disableScrollZoom?: boolean;
    disableZoomToMouse?: boolean;
    zoomEndTimeout?: number;
    shiftBoxZoom?: boolean;
    onPanStart?: (event: MouseEvent | TouchEvent) => void;
    onPanMove?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onPanEnd?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onZoom?: (x: number | undefined, y: number | undefined, scale: number | undefined, event: WheelEvent) => void;
    onZoomEnd?: () => void;
    onPanAndZoom?: (x: number, y: number, scale: number, event: WheelEvent) => void;
    onBoxStart?: (clientX: number, clientY: number, event: MouseEvent | TouchEvent) => void;
    onBoxMove?: (clientX1: number, clientY1: number, clientX2: number, clientY2: number, event: MouseEvent | TouchEvent) => void;
    onBoxEnd?: (clientX1: number, clientY1: number, clientX2: number, clientY2: number, event: MouseEvent | TouchEvent) => void;
}

export default function panAndZoom<P = any>(WrappedComponent: React.ElementType<P>): React.ComponentClass<Overwrite<P, PanAndZoomHOCProps>> {
    return class PanAndZoomHOC extends React.PureComponent<PanAndZoomHOCProps, never> {
        static propTypes = {
            x: PropTypes.number,
            y: PropTypes.number,
            scale: PropTypes.number,
            scaleFactor: PropTypes.number,
            minScale: PropTypes.number,
            maxScale: PropTypes.number,
            renderOnChange: PropTypes.bool,
            passOnProps: PropTypes.bool,
            ignorePanOutside: PropTypes.bool,
            disableScrollZoom: PropTypes.bool,
            disableZoomToMouse: PropTypes.bool,
            zoomEndTimeout: PropTypes.number,
            onPanStart: PropTypes.func,
            onPanMove: PropTypes.func,
            onPanEnd: PropTypes.func,
            onZoom: PropTypes.func,
            onZoomEnd: PropTypes.func,
            onPanAndZoom: PropTypes.func
        };

        static defaultProps = {
            x: 0.5,
            y: 0.5,
            scale: 1,
            scaleFactor: Math.sqrt(2),
            minScale: Number.EPSILON,
            maxScale: Number.POSITIVE_INFINITY,
            renderOnChange: false,
            passOnProps: false
        };

        dx: number = 0;
        dy: number = 0;
        ds: number = 0;
        element: Element | null = null;
        zoomTimeout: number | null = null;

        componentWillReceiveProps(nextProps: PanAndZoomHOCProps) {
            if (this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
                this.dx = 0;
                this.dy = 0;
            }
            if (this.props.scale !== nextProps.scale) {
                this.ds = 0;
            }
        }

        componentDidMount() {
            this.registerEventHandlers();
        }

        componentWillUnmount() {
            this.unregisterEventHandlers();
            if (this.zoomTimeout !== null) {
                window.clearTimeout(this.zoomTimeout);
                this.zoomTimeout = null;
            }
        }

        handleWheel = (event: WheelEvent) => {
            if (this.props.disableScrollZoom || !this.hasPosition(event)) {
                return;
            }

            const x: number | undefined = this.props.x;
            const y: number | undefined = this.props.y;
            const scale: number | undefined = this.props.scale;
            const scaleFactor: number | undefined = this.props.scaleFactor;
            const minScale: number | undefined = this.props.minScale;
            const maxScale: number | undefined = this.props.maxScale;

            if (x !== undefined && y !== undefined && scale !== undefined && scaleFactor !== undefined && minScale !== undefined && maxScale !== undefined) {
                const { deltaY } = event;
                const newScale = deltaY < 0 ? Math.min((scale + this.ds) * scaleFactor, maxScale) : Math.max((scale + this.ds) / scaleFactor, minScale);
                const factor = newScale / (scale + this.ds);

                if (factor !== 1) {
                    const target = ReactDOM.findDOMNode(this);
                    if (target !== null && target instanceof HTMLElement) {
                        const { top, left, width, height } = target.getBoundingClientRect();
                        const { clientX, clientY } = this.normalizeTouchPosition(event, target);
                        const dx = this.props.disableZoomToMouse ? 0 : (clientX / width - 0.5) / (scale + this.ds);
                        const dy = this.props.disableZoomToMouse ? 0 : (clientY / height - 0.5) / (scale + this.ds);
                        const sdx = dx * (1 - 1 / factor);
                        const sdy = dy * (1 - 1 / factor);

                        this.dx += sdx;
                        this.dy += sdy;
                        this.ds = newScale - scale;

                        if (this.props.onPanAndZoom) {
                            this.props.onPanAndZoom(x + this.dx, y + this.dy, scale + this.ds, event);
                        }

                        if (this.props.renderOnChange) {
                            this.forceUpdate();
                        }
                    }
                }
            }

            if (this.props.onZoom) {
                this.props.onZoom(x, y, scale, event);
            }
            if (this.zoomTimeout !== null) {
                window.clearTimeout(this.zoomTimeout);
                this.zoomTimeout = null;
            }
            if (this.props.onZoomEnd) {
                this.zoomTimeout = window.setTimeout(this.props.onZoomEnd, this.props.zoomEndTimeout === undefined ? 500 : this.props.zoomEndTimeout);
            }

            event.preventDefault();
        };

        panning = false;
        boxZoom = false;
        panLastX = 0;
        panLastY = 0;
        boxX1 = 0;
        boxY1 = 0;

        handleMouseDown = (event: MouseEvent | TouchEvent) => {
            if (!this.panning && !this.boxZoom && this.hasPosition(event)) {
                const target = ReactDOM.findDOMNode(this);
                if (target !== null && target instanceof HTMLElement) {
                    const { clientX, clientY } = this.normalizeTouchPosition(event, target);

                    if (event.shiftKey && this.props.shiftBoxZoom) {
                        this.boxX1 = clientX;
                        this.boxY1 = clientY;
                        this.boxZoom = true;

                        if (this.props.onBoxStart) {
                            this.props.onBoxStart(this.boxX1, this.boxY1, event);
                        }
                    } else {
                        this.panLastX = clientX;
                        this.panLastY = clientY;
                        this.panning = true;

                        if (this.props.onPanStart) {
                            this.props.onPanStart(event);
                        }
                    }

                    document.addEventListener('mousemove', this.handleMouseMove, { passive: false });
                    document.addEventListener('mouseup', this.handleMouseUp, { passive: false });
                    document.addEventListener('touchmove', this.handleMouseMove, { passive: false });
                    document.addEventListener('touchend', this.handleMouseUp, { passive: false });
                }
            }
        };

        handleMouseMove = (event: MouseEvent | TouchEvent) => {
            if ((this.panning || this.boxZoom) && this.hasPosition(event)) {
                const target = ReactDOM.findDOMNode(this);
                if (target !== null && target instanceof HTMLElement) {
                    const { clientX, clientY } = this.normalizeTouchPosition(event, target);

                    if (this.panning) {
                        const x: number | undefined = this.props.x;
                        const y: number | undefined = this.props.y;
                        const scale: number | undefined = this.props.scale;
                        const { width, height } = target.getBoundingClientRect();

                        if (x !== undefined && y !== undefined && scale !== undefined) {
                            if (!this.props.ignorePanOutside || 0 <= clientX && clientX <= width && 0 <= clientY && clientY <= height) {
                                const dx = clientX - this.panLastX;
                                const dy = clientY - this.panLastY;
                                this.panLastX = clientX;
                                this.panLastY = clientY;
                                const sdx = dx / (width * (scale + this.ds));
                                const sdy = dy / (height * (scale + this.ds));
                                this.dx -= sdx;
                                this.dy -= sdy;

                                if (this.props.onPanMove) {
                                    this.props.onPanMove(x + this.dx, y + this.dy, event);
                                }

                                if (this.props.renderOnChange) {
                                    this.forceUpdate();
                                }
                            }
                        }
                    } else {
                        if (this.props.onBoxMove) {
                            this.props.onBoxMove(this.boxX1, this.boxY1, clientX, clientY, event);
                        }
                    }
                }
            }
        };

        handleMouseUp = (event: MouseEvent | TouchEvent) => {
            if (this.panning || this.boxZoom) {
                const target = ReactDOM.findDOMNode(this);
                if (target !== null && target instanceof HTMLElement) {
                    let clientX: number | null = null;
                    let clientY: number | null = null;
                    if (this.hasPosition(event)) {
                        const position = this.normalizeTouchPosition(event, target);
                        clientX = position.clientX;
                        clientY = position.clientY;
                    }
                    if (this.panning) {
                        const x: number | undefined = this.props.x;
                        const y: number | undefined = this.props.y;
                        const scale: number | undefined = this.props.scale;

                        if (x !== undefined && y !== undefined && scale !== undefined) {
                            const { width, height } = target.getBoundingClientRect();

                            if (clientX !== null && clientY !== null && (!this.props.ignorePanOutside || 0 <= clientX && clientX <= width && 0 <= clientY && clientY <= height)) {
                                const dx = clientX - this.panLastX;
                                const dy = clientY - this.panLastY;
                                this.panLastX = clientX;
                                this.panLastY = clientY;
                                const sdx = dx / (width * (scale + this.ds));
                                const sdy = dy / (height * (scale + this.ds));
                                this.dx -= sdx;
                                this.dy -= sdy;
                            }

                            this.panning = false;

                            if (this.props.onPanEnd) {
                                this.props.onPanEnd(x + this.dx, y + this.dy, event);
                            }

                            if (this.props.renderOnChange) {
                                this.forceUpdate();
                            }
                        }
                    } else {
                        this.boxZoom = false;

                        if (this.props.onBoxEnd) {
                            if (clientX !== null && clientY !== null) {
                                this.props.onBoxEnd(this.boxX1, this.boxY1, clientX, clientY, event);
                            } else {
                                this.props.onBoxEnd(this.boxX1, this.boxY1, this.panLastX, this.panLastY, event);
                            }
                        }
                    }
                }

                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseup', this.handleMouseUp);
                document.removeEventListener('touchmove', this.handleMouseMove);
                document.removeEventListener('touchend', this.handleMouseUp);
            }
        };

        hasPosition(event: MouseEvent | TouchEvent) {
            return !('targetTouches' in event) || event.targetTouches.length >= 1;
        }

        normalizeTouchPosition(event: MouseEvent | TouchEvent, parent: HTMLElement | null) {
            const position = {
                clientX: ('targetTouches' in event) ? event.targetTouches[0].pageX : event.clientX,
                clientY: ('targetTouches' in event) ? event.targetTouches[0].pageY : event.clientY
            };

            while (parent && parent.offsetParent && parent.offsetParent instanceof HTMLElement) {
                position.clientX -= parent.offsetLeft - parent.scrollLeft;
                position.clientY -= parent.offsetTop - parent.scrollTop;
                parent = parent.offsetParent;
            }

            return position;
        }

        unregisterEventHandlers() {
            if (this.panning || this.boxZoom) {
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseup', this.handleMouseUp);
                document.removeEventListener('touchmove', this.handleMouseMove);
                document.removeEventListener('touchend', this.handleMouseUp);
            }
            const component = ReactDOM.findDOMNode(this);
            if (component instanceof HTMLElement) {
                component.removeEventListener('mousedown', this.handleMouseDown);
                component.removeEventListener('touchstart', this.handleMouseDown);
                component.removeEventListener('wheel', this.handleWheel);
            }
        }

        registerEventHandlers() {
            const component = ReactDOM.findDOMNode(this);
            if (component instanceof HTMLElement) {
                component.addEventListener('mousedown', this.handleMouseDown, { passive: false });
                component.addEventListener('touchstart', this.handleMouseDown, { passive: false });
                component.addEventListener('wheel', this.handleWheel, { passive: false });
            }
            if (this.panning || this.boxZoom) {
                document.addEventListener('mousemove', this.handleMouseMove, { passive: false });
                document.addEventListener('mouseup', this.handleMouseUp, { passive: false });
                document.addEventListener('touchmove', this.handleMouseMove, { passive: false });
                document.addEventListener('touchend', this.handleMouseUp, { passive: false });
            }
        }

        reregisterEventHandlers() {
            this.unregisterEventHandlers();
            this.registerEventHandlers();
        }

        render() {
            const {
                scaleFactor,
                x: tempX,
                y: tempY,
                scale: tempScale,
                minScale,
                maxScale,
                onPanStart,
                onPanMove,
                onPanEnd,
                onZoom,
                onPanAndZoom,
                renderOnChange,
                passOnProps,
                ignorePanOutside,
                disableScrollZoom,
                disableZoomToMouse,
                zoomEndTimeout,
                onZoomEnd,
                shiftBoxZoom,
                onBoxStart,
                onBoxMove,
                onBoxEnd,
                ...other
            } = this.props;

            const x: number | undefined = this.props.x;
            const y: number | undefined = this.props.y;
            const scale: number | undefined = this.props.scale;

            if (x !== undefined && y !== undefined && scale !== undefined) {
                const passedProps = passOnProps ? { x: x + this.dx, y: y + this.dy, scale: scale + this.ds } : {};
                return React.createElement(WrappedComponent, Object.assign({}, passedProps, other) as P);
            } else {
                return null;
            }
        }
    } as any as React.ComponentClass<Overwrite<P, PanAndZoomHOCProps>>;
};