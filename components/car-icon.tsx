import Svg, { Circle, Path } from 'react-native-svg';

// A simple outline car, drawn to match the other outline icons (the icon library has no car).
export function CarIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 6.8h11a2 2 0 0 1 1.9 1.4L21 13v4.5a1 1 0 0 1-1 1h-1.5" />
      <Path d="M3 13v4.5a1 1 0 0 0 1 1h1.5" />
      <Path d="M3 13h18" />
      <Circle cx={7.5} cy={18.5} r={1.5} />
      <Circle cx={16.5} cy={18.5} r={1.5} />
    </Svg>
  );
}
