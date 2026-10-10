// Tailwind setup for the CDN build.
// Brand colors and fonts live here, and so do the animations, which gives us
// classes like animate-rise and animate-bob to use in the markup.

tailwind.config = {
  theme: {
    extend: {
      colors: {
        charcoal: '#121212', // page background
        panel: '#1a1a1a',    // cards
        ink: '#0a0a0a',      // text on neon / white
        neon: '#00FF66',
        ember: '#FF5500',
        mute: '#9aa39e',     // secondary text
      },

      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        body: ['Archivo', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },

      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(34px)' },
          to: { opacity: '1', transform: 'none' },
        },
        swap: {
          from: { opacity: '0', transform: 'translateX(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        blink: { '50%': { opacity: '0' } },
        bob: { '50%': { transform: 'translateY(-10px)' } },
        grow: { from: { width: '0' } },
        flash: {
          '0%': { color: '#00FF66', transform: 'scale(1.25)' },
          '100%': { color: '#ffffff', transform: 'none' },
        },
        pingNeon: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,255,102,.6)' },
          '70%': { boxShadow: '0 0 0 10px rgba(0,255,102,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,255,102,0)' },
        },
        pingEmber: {
          '0%': { boxShadow: '0 0 0 0 rgba(255,85,0,.7)' },
          '70%': { boxShadow: '0 0 0 9px rgba(255,85,0,0)' },
        },
        ringOut: {
          '0%': { transform: 'scale(1)', opacity: '.7' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,102,.5), 0 10px 30px rgba(0,255,102,.3)' },
          '60%': { boxShadow: '0 0 0 16px rgba(0,255,102,0), 0 10px 30px rgba(0,255,102,.3)' },
        },
      },

      animation: {
        rise: 'rise .9s cubic-bezier(.2,.8,.2,1) both',
        swap: 'swap .5s cubic-bezier(.2,.8,.2,1) both',
        blink: 'blink 1s steps(2) infinite',
        bob: 'bob 6s ease-in-out infinite',
        grow: 'grow 1.1s cubic-bezier(.2,.8,.2,1) both',
        flash: 'flash .8s',
        'ping-neon': 'pingNeon 1.8s infinite',
        'ping-ember': 'pingEmber 1.4s infinite',
        'ring-out': 'ringOut 2.4s infinite',
        glow: 'glow 2.6s infinite',
      },
    },
  },
};
