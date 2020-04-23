import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

export default {
  input: './src/index.tsx',
  output: {
    file: __dirname + '/public/index.js',
    format: 'iife',
    name: 'main',
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  },
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    resolve(),
    commonJS(),
    replace({
      'process.env.WS_URL': JSON.stringify(process.env.WS_URL)
    })
  ]
}