/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    border: '#334155'
                },
                brand: {
                    primary: '#3b82f6',
                    secondary: '#8b5cf6',
                    accent: '#10b981'
                }
            }
        },
    },
    plugins: [],
}
