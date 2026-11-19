import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

// Fluvio brand mark: the dark leaf tile from assets/brand/leaf-dark.svg.
// The tile carries its own rounded background, so no extra wrapper color is needed.
export function FluvioLogo({ size = 72 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      importantForAccessibility="no"
      accessibilityElementsHidden
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <G>
          <Rect fill="#20282d" width="200" height="200" rx="25.95" ry="25.95" />
          <Path fill="#82b5cf" d="M100.98,70.2c-17,.17-33.9,4.08-47.6,14.48-9.99,7.59-17.56,18.09-20.88,30.21-.24.51-.61.36-.61-.2l.04-14.31c.02-6.54.83-12.86,2.37-19.22,4.41-18.06,15.13-34.33,30.6-44.79,10.8-7.3,23.56-11.34,36.68-11.34l70.2-.04c-.26,16.79-9.91,31.76-24.57,39.59-6.53,3.5-13.61,5.22-21.04,5.23L100.98,70.2Z" />
          <Path fill="#356b85" d="M90.61,135.45s.05.02.05.05c.05,3.49-.55,6.87-1.65,10.28-5.15,15.92-19.7,27.18-36.52,28.1l-20.29.16c-.16,0-.3-.13-.3-.29v-1.16c.07.05.17.12.25.2,3.25-14.81,12.74-26.65,26.76-32.49C69.07,136.07,79.8,135.25,90.61,135.45Z" />
          <Path fill="#82b5cf" fillOpacity={0.65} d="M140.77,91.6l-50.26-.37c-14.9-.37-29.6,3.78-41.13,13.98-9.53,8.45-17.49,20.3-17.36,32.67l-.13,35.73c0,.7.62.55.75-.24,2.33-10.2,7.92-19.39,16.24-25.8,11.81-9.09,26.66-10.84,41.15-10.85,0,0,26.67,2.74,40.66-17.16,5.89-8.39,10.17-17.6,10.25-27.78C141.02,91.71,140.97,91.6,140.77,91.6Z" />
        </G>
      </Svg>
    </View>
  );
}
