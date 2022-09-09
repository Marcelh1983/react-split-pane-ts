// import React from 'react';

// interface Props {
//   className?: string;
//   style?: React.CSSProperties;
//   children: React.ReactNode | React.ReactNode[];
//   size: string;
//   split: 'vertical' | 'horizontal';
//   ref?: React.RefObject<HTMLDivElement>;
// }

// export function Pane({ children, className, split, style, size, ref }: Props) {
//   const classes = ['Pane', split, className];
//   style = {
//     ...{
//       flex: 1,
//       position: 'relative',
//       outline: 'none',
//     },
//     ...style,
//   };

//   if (size) {
//     if (split === 'vertical') {
//       style.width = size;
//     } else {
//       style.height = size;
//       style.display = 'flex';
//     }
//     style.flex = 'none';
//   }
//   return (
//     <div ref={ref} className={classes.join(' ')} style={style}>
//       {children}
//     </div>
//   );
// }
