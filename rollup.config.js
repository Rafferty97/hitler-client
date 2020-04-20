import typescript from 'rollup-plugin-typescript';
// import resolve from 'rollup-plugin-node-resolve';
// import commonJS from 'rollup-plugin-commonjs';

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
    typescript()
  ]
}