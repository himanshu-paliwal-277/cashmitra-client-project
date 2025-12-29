/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#F0F4FF',
  				'100': '#E0E9FF',
  				'200': '#C7D7FF',
  				'300': '#A3BFFF',
  				'400': '#7B93FF',
  				'500': '#4C6FFF',
  				'600': '#3A56CC',
  				'700': '#2D4399',
  				'800': '#233366',
  				'900': '#1A2633',
  				main: '#4C6FFF',
  				light: '#7B93FF',
  				dark: '#3A56CC',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#E8F8F0',
  				'100': '#C8F0D8',
  				'200': '#9DE8B8',
  				'300': '#6EDF95',
  				'400': '#42D674',
  				'500': '#00C853',
  				'600': '#00A142',
  				'700': '#007A32',
  				'800': '#005423',
  				'900': '#002E14',
  				main: '#00C853',
  				light: '#5DFC82',
  				dark: '#00A142',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			warning: {
  				'50': '#FFF8E1',
  				'100': '#FFECB3',
  				'200': '#FFE082',
  				'300': '#FFD54F',
  				'400': '#FFCA28',
  				'500': '#FFB300',
  				'600': '#FF8F00',
  				'700': '#FF6F00',
  				'800': '#E65100',
  				'900': '#BF360C',
  				main: '#FFB300',
  				light: '#FFD54F',
  				dark: '#FF8F00',
  				DEFAULT: '#FFB300'
  			},
  			error: {
  				'50': '#FFEBEE',
  				'100': '#FFCDD2',
  				'200': '#EF9A9A',
  				'300': '#E57373',
  				'400': '#EF5350',
  				'500': '#E53935',
  				'600': '#D32F2F',
  				'700': '#C62828',
  				'800': '#B71C1C',
  				'900': '#8B0000',
  				main: '#E53935',
  				light: '#EF5350',
  				dark: '#C62828',
  				DEFAULT: '#E53935'
  			},
  			success: {
  				'50': '#E8F8F0',
  				'100': '#C8F0D8',
  				'200': '#9DE8B8',
  				'300': '#6EDF95',
  				'400': '#42D674',
  				'500': '#00C853',
  				'600': '#00A142',
  				'700': '#007A32',
  				'800': '#005423',
  				'900': '#002E14',
  				main: '#00C853',
  				light: '#5DFC82',
  				dark: '#00A142',
  				DEFAULT: '#00C853'
  			},
  			info: {
  				'50': '#E3F2FD',
  				'100': '#BBDEFB',
  				'200': '#90CAF9',
  				'300': '#64B5F6',
  				'400': '#42A5F5',
  				'500': '#2196F3',
  				'600': '#1E88E5',
  				'700': '#1976D2',
  				'800': '#1565C0',
  				'900': '#0D47A1',
  				main: '#2196F3',
  				light: '#64B5F6',
  				dark: '#1976D2',
  				DEFAULT: '#2196F3'
  			},
  			grey: {
  				'50': '#FAFAFA',
  				'100': '#F5F5F5',
  				'200': '#EEEEEE',
  				'300': '#E0E0E0',
  				'400': '#BDBDBD',
  				'500': '#9E9E9E',
  				'600': '#757575',
  				'700': '#616161',
  				'800': '#424242',
  				'900': '#212121'
  			},
  			background: 'hsl(var(--background))',
  			border: 'hsl(var(--border))',
  			text: {
  				primary: '#212121',
  				secondary: '#757575',
  				disabled: '#BDBDBD',
  				hint: '#9E9E9E'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Manrope',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'Consolas',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: '0.75rem',
  			sm: '0.875rem',
  			base: '1rem',
  			lg: '1.125rem',
  			xl: '1.25rem',
  			'2xl': '1.5rem',
  			'3xl': '1.875rem',
  			'4xl': '2.25rem',
  			'5xl': '3rem',
  			'6xl': '3.75rem'
  		},
  		fontWeight: {
  			light: '300',
  			regular: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700',
  			extrabold: '800'
  		},
  		lineHeight: {
  			tight: '1.25',
  			normal: '1.5',
  			relaxed: '1.75'
  		},
  		letterSpacing: {
  			tight: '-0.025em',
  			normal: '0',
  			wide: '0.025em'
  		},
  		spacing: {
  			'0': '0',
  			'1': '0.25rem',
  			'2': '0.5rem',
  			'3': '0.75rem',
  			'4': '1rem',
  			'5': '1.25rem',
  			'6': '1.5rem',
  			'8': '2rem',
  			'10': '2.5rem',
  			'12': '3rem',
  			'16': '4rem',
  			'20': '5rem',
  			'24': '6rem',
  			'32': '8rem',
  			'40': '10rem',
  			'48': '12rem',
  			'56': '14rem',
  			'64': '16rem'
  		},
  		borderRadius: {
  			none: '0',
  			sm: 'calc(var(--radius) - 4px)',
  			base: '0.25rem',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '0.75rem',
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			full: '9999px'
  		},
  		boxShadow: {
  			none: 'none',
  			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  			inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  		},
  		zIndex: {
  			hide: '-1',
  			auto: 'auto',
  			base: '0',
  			docked: '10',
  			dropdown: '1000',
  			sticky: '1100',
  			banner: '1200',
  			overlay: '1300',
  			modal: '1400',
  			popover: '1500',
  			skipLink: '1600',
  			toast: '1700',
  			tooltip: '1800'
  		},
  		transitionDuration: {
  			fastest: '75ms',
  			faster: '100ms',
  			fast: '150ms',
  			normal: '200ms',
  			slow: '300ms',
  			slower: '500ms',
  			slowest: '1000ms'
  		},
  		transitionTimingFunction: {
  			easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  			easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  			easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  			sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			fadeInDown: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeInUp: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideIn: {
  				from: {
  					opacity: '0',
  					transform: 'translateX(-20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			slideUp: {
  				from: {
  					opacity: '0',
  					transform: 'translateX(-50%) translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(-50%) translateY(0)'
  				}
  			},
  			spin: {
  				from: {
  					transform: 'rotate(0deg)'
  				},
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			fadeInDown: 'fadeInDown 0.3s ease forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
