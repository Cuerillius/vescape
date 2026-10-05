import { StyleSheet, View } from 'react-native'
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia'

import { useCanvasSize } from '@/hooks/useCanvasSize'
import type { TuneCardShader } from '@/modules/tune/lib/tuneCardArt'

/**
 * Smooth color gradients under fine grain, so no area is a flat color. The main ribbon is the
 * distance to a warped line, the brake ribbon the same field shifted down; both turn that distance
 * into how far a pixel blends toward the ribbon color, so a soft edge reads as haze and a crisp one
 * as a line. The base drifts between two shades with slow noise, and the grain is strongest where
 * the colors are mid-blend and quiet on flat areas. Uniforms come from
 * `tuneCardShader`; the noise is value noise on a float hash, so it needs no texture.
 */
const TUNE_CARD_SKSL = `
const float GRAIN_FLAT = 0.025;
const float GRAIN_EDGE = 0.14;

uniform float2 size;
uniform float angle;
uniform float warp;
uniform float freq;
uniform float ripple;
uniform float width;
uniform float feather;
uniform float cell;
uniform float brake;
uniform float brakeWidth;
uniform float seed;
uniform float3 baseColor;
uniform float3 shadeColor;
uniform float3 ribbonColor;
uniform float3 brakeColor;

float hash21(float2 p) {
  float3 p3 = fract(float3(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(float2 p, float s) {
  float2 i = floor(p);
  float2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i + s);
  float b = hash21(i + float2(1.0, 0.0) + s);
  float c = hash21(i + float2(0.0, 1.0) + s);
  float d = hash21(i + float2(1.0, 1.0) + s);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(float2 p, float s) {
  return vnoise(p, s) * 0.55 + vnoise(p * 2.1, s + 7.0) * 0.3 + vnoise(p * 4.3, s + 13.0) * 0.15;
}

float4 main(float2 xy) {
  float aspect = size.x / size.y;
  float2 p = float2(xy.x / size.y - 0.5 * aspect, xy.y / size.y - 0.5);
  float ca = cos(angle);
  float sa = sin(angle);
  float ry = -sa * p.x + ca * p.y;
  float rx = ca * p.x + sa * p.y;
  float n1 = fbm(float2(rx + 2.0, ry + 2.0) * freq * 0.9, seed);
  float n2 = fbm(float2(rx + 9.0, ry + 5.0) * freq * 0.9, seed + 31.0);
  float d1 = ry + (n1 - 0.5) * warp * 1.6 + sin(rx * 2.2 + seed) * ripple;
  float d2 = ry - 0.36 + (n2 - 0.5) * warp * 1.2;
  float p1 = clamp(0.5 + 0.5 * (width - abs(d1)) / feather, 0.0, 1.0);
  float p2 = step(0.03, brake) * clamp(0.5 + 0.5 * (brakeWidth - abs(d2)) / feather, 0.0, 1.0);
  float drift = vnoise(p * 1.1 + 3.0, seed + 5.0);
  float3 color = mix(baseColor, shadeColor, smoothstep(0.3, 0.7, drift) * 0.7);
  color = mix(color, ribbonColor, p1);
  color = mix(color, brakeColor, p2);
  float edge = max(4.0 * p1 * (1.0 - p1), 4.0 * p2 * (1.0 - p2));
  float grain = mix(GRAIN_FLAT, GRAIN_EDGE, edge);
  color += (hash21(floor(xy / cell) + seed + 11.0) - 0.5) * grain;
  return float4(clamp(color, 0.0, 1.0), 1.0);
}
`

const tuneCardEffect = Skia.RuntimeEffect.Make(TUNE_CARD_SKSL)
if (!tuneCardEffect) throw new Error('Tune card shader failed to compile')

/** Background of a tuning card page, drawn once on one static canvas. */
export function TuneCardArt({ shader }: { shader: TuneCardShader }) {
  const { size, onLayout } = useCanvasSize()
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.w > 0 && tuneCardEffect ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={size.w} height={size.h}>
            <Shader
              source={tuneCardEffect}
              uniforms={{ size: [size.w, size.h], ...shader.uniforms }}
            />
          </Rect>
        </Canvas>
      ) : null}
    </View>
  )
}
