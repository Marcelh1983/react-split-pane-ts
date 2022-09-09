import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Resizer, RESIZER_DEFAULT_CLASSNAME } from './resizer';

function unFocus() {
  if (document.getSelection()) {
    document.getSelection()?.empty();
  } else {
    try {
      window?.getSelection()?.removeAllRanges();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

function IsNullOrUndefined<T>(value: T) {
  return value === undefined || value === null;
}

interface Props {
  minSize?: number;
  maxSize?: number;
  primaryIndex?: number;
  split?: 'vertical' | 'horizontal';
  allowResize?: boolean;
  step?: number;
  children: React.ReactNode[];
  className?: string;
  paneClassName?: string;
  paneStyle?: React.CSSProperties;
  resizerClassName?: string;
  resizerStyle?: React.CSSProperties;
  style?: React.CSSProperties;

  onChange?: (sizes: PaneInfo[]) => void;
  onResizerClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onResizerDoubleClick?: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  onDragStarted?: () => void;
  onDragFinished?: (sizes: PaneSize[]) => void;
}

export interface PaneInfo {
  index: number;
  size: PaneSize;
}

export interface PaneSize {
  '%': number;
  px: number;
}

const sum = (array: number[]) =>
  array.reduce((partialSum, a) => partialSum + a, 0);
const percentage = (pointsGiven: number, pointsPossible: number) =>
  ~~((pointsGiven / pointsPossible) * 100);

export function SplitPane(props: Props) {
  const resizerRefs = useRef<HTMLElement[]>([]);
  const splitPane = useRef<HTMLDivElement>(null);
  // set default values;
  const split = props.split || 'vertical';
  const allowResize = IsNullOrUndefined(props.allowResize)
    ? true
    : props.allowResize;

  const [activeResizer, setActiveResizer] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<number>(0);
  //   const [resized, setResized] = useState<boolean>(false);
  //   const [paneInfos, setPaneInfos] = useState<PaneInfo[]>([]);

  const onTouchMove = useCallback(
    (event: TouchEvent) => {
      if (allowResize && activeResizer) {
        unFocus();
        const pane1 = activeResizer.previousElementSibling as HTMLElement;
        const pane2 = activeResizer.previousElementSibling as HTMLElement;
        if (pane1 && pane2) {
          const width = pane1.getBoundingClientRect().width;
          const height = pane1.getBoundingClientRect().height;
          const width2 = pane2.getBoundingClientRect().width;
          const height2 = pane2.getBoundingClientRect().height;
          const currentPosition =
            split === 'vertical'
              ? event.touches[0].clientX
              : event.touches[0].clientY;
          const pane1Size = split === 'vertical' ? width : height;
          const totalSize =
            split === 'vertical' ? width + width2 : height + height2;
          let positionDelta = position - currentPosition;
          if (props.step) {
            if (Math.abs(positionDelta) < props.step) {
              return;
            }
            // Integer division
            // eslint-disable-next-line no-bitwise
            positionDelta = ~~(positionDelta / props.step) * props.step;
          }
          let sizeDelta = positionDelta;
          //   let sizeDelta = isPrimaryFirst ? positionDelta : -positionDelta;

          const pane1Order = parseInt(window.getComputedStyle(pane1).order);
          const pane2Order = parseInt(window.getComputedStyle(pane2).order);
          if (pane1Order > pane2Order) {
            sizeDelta = -sizeDelta;
          }

          let newMaxSize = (props.maxSize && +props.maxSize) || 0;
          if (
            !IsNullOrUndefined(props.maxSize) &&
            props.maxSize !== undefined &&
            +props.maxSize <= 0 &&
            splitPane.current
          ) {
            if (split === 'vertical') {
              newMaxSize =
                splitPane.current.getBoundingClientRect().width + newMaxSize;
            } else {
              newMaxSize =
                splitPane.current.getBoundingClientRect().height + newMaxSize;
            }
          }

          let newSize = pane1Size - sizeDelta;
          const newPosition = position - positionDelta;

          if (newSize < (props.minSize || 0)) {
            newSize = props.minSize || 0;
          } else if (props.maxSize !== undefined && newSize > newMaxSize) {
            newSize = newMaxSize;
          } else {
            setPosition(newPosition);
            // setResized(true);
          }
          if (split === 'vertical') {
            pane1.style.width = `${totalSize - newSize}px`;
            pane2.style.width = `${newSize}px`;
          } else {
            pane1.style.height = `${totalSize - newSize}px`;
            pane2.style.height = `${newSize}px`;
          }
        }
      }
    },
    [
      activeResizer,
      allowResize,
      position,
      props.maxSize,
      props.minSize,
      props.step,
      split,
    ]
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const eventWithTouches = {
        ...event,
        touches: [{ clientX: event.clientX, clientY: event.clientY }],
      };
      onTouchMove(eventWithTouches as unknown as TouchEvent);
    },
    [onTouchMove]
  );

  const onMouseUp = useCallback(() => {
    if (allowResize && activeResizer) {
      setActiveResizer(null);
      if (props.onDragFinished) {
        const panes: HTMLElement[] = [];
        resizerRefs.current.forEach((r, i) => {
          if (i === 0 && r.previousElementSibling) {
            panes.push(r.previousElementSibling as HTMLElement);
          }
          if (r.nextElementSibling) {
            panes.push(r.nextElementSibling as HTMLElement);
          }
        });
        const sizes = panes.map((p) => {
          if (split === 'vertical') {
            return p.clientWidth;
          } else {
            return p.clientHeight;
          }
        });
        const total = sum(sizes);
        const paneSizes = sizes.map((size) => {
          return {
            px: size,
            '%': percentage(size, total),
          } as PaneSize;
        });
        props.onDragFinished(paneSizes);
      }
    }
  }, [activeResizer, allowResize, props, split]);

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  const onMouseDown = (event: MouseEvent) => {
    const eventWithTouches = {
      ...event,
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    };
    onTouchStart(eventWithTouches as unknown as TouchEvent);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (allowResize) {
      unFocus();
      const position =
        split === 'vertical'
          ? event.touches[0].clientX
          : event.touches[0].clientY;
      props.onDragStarted && props.onDragStarted();
      setPosition(position);
    }
  };

  const disabledClass = allowResize ? '' : 'disabled';
  const resizerClassNamesIncludingDefault = props.resizerClassName
    ? `${props.resizerClassName} ${RESIZER_DEFAULT_CLASSNAME}`
    : RESIZER_DEFAULT_CLASSNAME;

  let style: React.CSSProperties = {
    ...{
      display: 'flex',
      flex: '1',
      height: '100%',
      position: 'absolute',
      outline: 'none',
      overflow: 'hidden',
      userSelect: 'text',
      MozUserSelect: 'text',
      WebkitUserSelect: 'text',
      msUserSelect: 'text',
    },
    ...props.style,
  };

  if (split === 'vertical') {
    style = { ...style, flexDirection: 'row', left: 0, right: 0 };
  } else {
    style = {
      ...style,
      bottom: 0,
      flexDirection: 'column',
      minHeight: '100%',
      top: 0,
      width: '100%',
    };
  }

  const classes = ['SplitPane', props.className, split, disabledClass];
  return (
    <div className={classes.join(' ')} ref={splitPane} style={style}>
      {props.children
        .filter((c) => !!c)
        .map((child, index) => {
          let resizer: HTMLElement;
          return (
            <React.Fragment key={index}>
              {index !== 0 && (
                <Resizer
                  className={disabledClass}
                  ref={(element: HTMLElement) => {
                    if (element && !resizerRefs.current.includes(element)) {
                      resizerRefs.current.push(element);
                    }
                    if (element) {
                      resizer = element;
                    }
                  }}
                  onClick={(e) =>
                    props.onResizerClick && props.onResizerClick(e)
                  }
                  onDoubleClick={(e) =>
                    props.onResizerDoubleClick && props.onResizerDoubleClick(e)
                  }
                  onMouseDown={(e) => {
                    setActiveResizer(resizer);
                    onMouseDown(e as unknown as MouseEvent);
                  }}
                  onTouchStart={(e) => {
                    onTouchStart(e as unknown as TouchEvent);
                  }}
                  key="resizer"
                  resizerClassName={resizerClassNamesIncludingDefault}
                  split={split}
                  style={props.resizerStyle || {}}
                />
              )}
              {child}
            </React.Fragment>
          );
        })}
    </div>
  );
}
