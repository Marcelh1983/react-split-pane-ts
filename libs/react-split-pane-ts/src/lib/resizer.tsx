import React, { LegacyRef } from 'react';

export const RESIZER_DEFAULT_CLASSNAME = 'resizer';

interface Props {
  className?: string;
  style?: React.CSSProperties;
  size?: string;
  ref: LegacyRef<HTMLElement> | undefined;
  split: 'vertical' | 'horizontal';
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLSpanElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLSpanElement>) => void;
  resizerClassName?: string;
}

export const Resizer = React.forwardRef<HTMLElement, Props>((props, ref) => {
  const {
    className,
    onClick,
    onDoubleClick,
    onMouseDown,
    onTouchEnd,
    onTouchStart,
    resizerClassName,
    split,
    style,
  } = props;
  const classes = [resizerClassName, split, className];

  return (
    <span
      ref={ref}
      role="presentation"
      className={classes.join(' ')}
      style={style}
      onMouseDown={(event) => {
        onMouseDown && onMouseDown(event)}
      }
      onTouchStart={(event) => {
        event.preventDefault();
        onTouchStart && onTouchStart(event);
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        onTouchEnd && onTouchEnd(event);
      }}
      onClick={(event) => {
        if (onClick) {
          event.preventDefault();
          onClick && onClick(event);
        }
      }}
      onDoubleClick={(event) => {
        if (onDoubleClick) {
          event.preventDefault();
          onDoubleClick(event);
        }
      }}
    />
  );
});
