default input
* `gl_FragCoord` - screen coordinates

default output
* `gl_FragColor` - output pixel color

"uniform" - uniform for all threads
"varying" - varies for each thread

Example: Gradient
```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    float y = st.x;
    vec3 color = vec3(y);
    gl_FragColor = vec4(color, 1.0)
}
```