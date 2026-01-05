import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { heyApiPlugin } from '@hey-api/vite-plugin';

export default defineConfig({
    build: {
        outDir:  path.resolve(__dirname, './build'),
        emptyOutDir: true, // Clears the custom directory before building
    },
    publicDir: path.resolve(__dirname, './public'),
    server: {
        fs: {
            // Restrict file system access to the project root and one specific shared folder
            allow: [
                path.resolve(__dirname),
                path.resolve(__dirname, "./local_utils"),
            ],
        },
    },
    plugins: [react(),
        // Cast to 'any' to bypass the 'enforce' type mismatch
        '@hey-api/client-fetch',
        '@hey-api/typescript',
        '@hey-api/sdk',
        (heyApiPlugin as any)({
            config: {
                input: 'http://localhost:8000/openapi.json',
                output: './src/apis/client',
                client: '@hey-api/client-fetch',
            },
        })],
});