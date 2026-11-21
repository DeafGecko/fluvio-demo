import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/use-theme';

// Four wave layers along the bottom quarter of the splash. Each one drifts sideways in a seamless
// loop and also rises and falls like water, each on its own rhythm.
// Listed back to front. The 25%, 50%, and 75% waves sit behind, so their edges show over the
// light background. The solid wave is in front at the bottom, so it doesn't hide the others.
//   top:   where the wave's top edge sits (fraction of the wave area height)
//   ys:    vertical keyframes as fractions of the wave area height; the last one is 0 so the loop joins up
//   yd:    duration of each keyframe move in ms
const LAYERS = [
  { top: 0.12, amp: 0.08, phase: 0.0, opacity: 0.25, duration: 10000, ys: [-0.07, 0.05, 0], yd: [4200, 3400, 3000] },
  { top: 0.32, amp: 0.08, phase: 1.6, opacity: 0.5, duration: 8000, ys: [0.06, -0.08, 0], yd: [3600, 4200, 2800] },
  { top: 0.52, amp: 0.08, phase: 3.2, opacity: 0.75, duration: 6500, ys: [-0.06, 0.07, 0], yd: [3000, 3800, 3300] },
  { top: 0.72, amp: 0.08, phase: 4.8, opacity: 1, duration: 5000, ys: [0.05, -0.06, 0], yd: [2800, 3300, 3600] },
];

// Extra height under the wave area, so a wave that dips still covers the bottom edge.
const PAD_FRAC = 0.2;

// One wave tile, drawn two screens wide, so moving it left by one screen width loops with no jump.
// The fill runs down past the bottom of the wave area.
function wavePath(width: number, height: number, top: number, amp: number, phase: number) {
  const tileWidth = width * 2;
  const topY = height * top;
  const A = height * amp;
  const bottom = height * (1 + PAD_FRAC);
  const step = Math.max(8, Math.round(width / 60));
  let d = '';
  for (let x = 0; x <= tileWidth + step; x += step) {
    const xx = Math.min(x, tileWidth);
    const y = topY + A * Math.sin((2 * Math.PI * xx) / width + phase);
    d += (d ? ' L' : 'M') + xx.toFixed(1) + ' ' + y.toFixed(1);
  }
  d += ` L${tileWidth} ${bottom} L0 ${bottom} Z`;
  return { d, tileWidth, svgHeight: bottom };
}

// Animated wave layers for the splash. With Reduce Motion on, they stay still.
export function SplashWaves() {
  const { width, height: windowHeight } = useWindowDimensions();
  const { c } = useTheme();
  const height = Math.round(windowHeight * 0.25);
  const [xs] = useState(() => LAYERS.map(() => new Animated.Value(0)));
  const [ys] = useState(() => LAYERS.map(() => new Animated.Value(0)));

  useEffect(() => {
    let active = true;
    let loops: Animated.CompositeAnimation[] = [];
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      loops = LAYERS.flatMap((layer, i) => [
        // Sideways drift, one screen width per cycle.
        Animated.loop(
          Animated.timing(xs[i], { toValue: -width, duration: layer.duration, easing: Easing.linear, useNativeDriver: true }),
        ),
        // Rise and fall with its own keyframes, like water.
        Animated.loop(
          Animated.sequence(
            layer.ys.map((k, j) => Animated.timing(ys[i], {
              toValue: k * height,
              duration: layer.yd[j],
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })),
          ),
        ),
      ]);
      loops.forEach((loop) => loop.start());
    });
    return () => {
      active = false;
      loops.forEach((loop) => loop.stop());
    };
  }, [xs, ys, width, height]);

  const paths = useMemo(
    () => LAYERS.map((layer) => wavePath(width, height, layer.top, layer.amp, layer.phase)),
    [width, height],
  );

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none" importantForAccessibility="no">
      {LAYERS.map((layer, i) => (
        <Animated.View
          key={i}
          style={[
            styles.layer,
            { opacity: layer.opacity, transform: [{ translateX: xs[i] }, { translateY: ys[i] }] },
          ]}
        >
          <Svg width={paths[i].tileWidth} height={paths[i].svgHeight}>
            <Path d={paths[i].d} fill={c.accent} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  layer: { position: 'absolute', left: 0, top: 0 },
});
