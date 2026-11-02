// Line icons copied from the UI drafts' SVGs, so the app matches the mockups exactly.
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'search' | 'post' | 'messages' | 'closet' | 'board' | 'swipe' | 'sliders' | 'check'
  | 'back' | 'close' | 'heart' | 'camera' | 'send' | 'chevron' | 'plus' | 'bell' | 'globe' | 'x' | 'arrowUp' | 'image';

export function Icon({ name, size = 24, color = '#000', stroke = 1.7, fill = 'none' }: { name: IconName; size?: number; color?: string; stroke?: number; fill?: string }) {
  const p = { stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path {...p} d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />}
      {name === 'search' && (<><Path {...p} d="M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" /><Path {...p} d="M16 16l4.5 4.5" /></>)}
      {name === 'post' && (<><Path {...p} d="M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5z" /><Path {...p} d="M12 8v8M8 12h8" /></>)}
      {name === 'messages' && <Path {...p} d="M5 18.5l1-3.2A7.5 7.5 0 1 1 9 18.6z" />}
      {name === 'closet' && (<><Path {...p} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><Path {...p} d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>)}
      {name === 'board' && (<><Rect {...p} x={4} y={4} width={7} height={9} rx={2} /><Rect {...p} x={13} y={4} width={7} height={6} rx={2} /><Rect {...p} x={4} y={15} width={7} height={5} rx={2} /><Rect {...p} x={13} y={12} width={7} height={8} rx={2} /></>)}
      {name === 'swipe' && (<><Rect {...p} x={6.5} y={4} width={11} height={16} rx={3} /><Path {...p} d="M3 8v8M21 8v8" /></>)}
      {name === 'sliders' && (<><Path {...p} d="M4 7h9M17 7h3M4 17h3M11 17h9" /><Circle {...p} cx={15} cy={7} r={2} /><Circle {...p} cx={9} cy={17} r={2} /></>)}
      {name === 'check' && <Path {...p} d="M5 12.5l4.5 4.5L19 7.5" />}
      {name === 'back' && <Path {...p} d="M15 5l-7 7 7 7" />}
      {name === 'chevron' && <Path {...p} d="M9 5l7 7-7 7" />}
      {(name === 'close' || name === 'x') && <Path {...p} d="M6 6l12 12M18 6L6 18" />}
      {name === 'heart' && <Path {...p} fill={fill} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />}
      {name === 'camera' && (<><Path {...p} d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" /><Circle {...p} cx={12} cy={12.5} r={3.3} /></>)}
      {name === 'send' && <Path {...p} d="M4 12l16-7-6 15-2.5-6.5z" />}
      {name === 'plus' && <Path {...p} d="M12 5v14M5 12h14" />}
      {name === 'bell' && (<><Path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><Path {...p} d="M10 20.5a2 2 0 0 0 4 0" /></>)}
      {name === 'globe' && (<><Circle {...p} cx={12} cy={12} r={8} /><Path {...p} d="M4 12h16M12 4c2.5 2.7 2.5 13.3 0 16M12 4c-2.5 2.7-2.5 13.3 0 16" /></>)}
      {name === 'arrowUp' && <Path {...p} d="M12 19V5M6 11l6-6 6 6" />}
      {name === 'image' && (<><Rect {...p} x={4} y={5} width={16} height={14} rx={3} /><Circle {...p} cx={9} cy={10} r={1.6} /><Path {...p} d="M5 17l4.5-4 3.5 3 2.5-2 3.5 3" /></>)}
    </Svg>
  );
}
