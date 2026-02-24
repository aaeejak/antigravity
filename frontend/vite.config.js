import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'jsdom',
        exclude: ['**/supabase.test.js'], // skip testing direct network API wrapper as it relies on CDN import and real credentials
    },
});
