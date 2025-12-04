# Tailwind CSS Setup Guide

## Overview
The frontend has been migrated from SCSS to **Tailwind CSS**. All styling is now handled through Tailwind utility classes.

## Files Changed

### New Files Created
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration with Tailwind & Autoprefixer
- `src/styles/globals.css` - Global CSS with Tailwind directives

### Updated Files
- `package.json` - Removed `sass`, added `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `autoprefixer`
- `src/main.tsx` - Changed import from `app.scss` to `globals.css`

### Old SCSS Files (Can be Archived)
All SCSS files in `src/styles/` can now be removed or archived:
- `src/styles/app.scss`
- `src/styles/_cart.scss`
- `src/styles/_footer.scss`
- `src/styles/_home.scss`
- `src/styles/_login.scss`
- `src/styles/_product-details.scss`
- `src/styles/_search.scss`
- `src/styles/_shipping.scss`
- `src/styles/admin-styles/*`

## How to Use Tailwind in Components

### Example: Styling a Button
**Before (SCSS):**
```tsx
// In component
<button className="btn-primary">Click me</button>

// In SCSS
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  &:hover {
    background-color: #0056b3;
  }
}
```

**After (Tailwind):**
```tsx
<button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-800">
  Click me
</button>
```

### Common Tailwind Classes
- **Layout**: `flex`, `grid`, `block`, `inline`, `relative`, `absolute`
- **Spacing**: `p-4` (padding), `m-2` (margin), `gap-3` (gap)
- **Colors**: `bg-blue-600`, `text-white`, `border-gray-300`
- **Typography**: `text-lg`, `font-bold`, `text-center`
- **Responsive**: `md:text-lg` (medium screens), `lg:grid` (large screens)
- **Interactive**: `hover:bg-blue-800`, `focus:outline-blue-500`

## How to Extend Tailwind

### Adding Custom Colors
Edit `tailwind.config.js`:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        secondary: "#6c757d",
      },
    },
  },
  plugins: [],
}
```

Then use: `className="bg-primary text-white"`

### Adding Custom Components
In `src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800;
  }
}
```

## Running the Project

### Development
```bash
npm run dev
# Opens on http://localhost:5174/
```

### Build
```bash
npm run build
# Generates optimized production build
```

### Preview Production Build
```bash
npm run preview
```

## Benefits of Tailwind
✅ Smaller CSS bundle (only includes used classes)
✅ Faster development with utility-first approach
✅ No naming conflicts or dead code
✅ Easy responsive design with breakpoint prefixes
✅ Dark mode support built-in
✅ Better maintainability

## Troubleshooting

**Issue**: Styles not showing after build  
**Solution**: Ensure all component files are in `content` array in `tailwind.config.js`

**Issue**: Build size still large  
**Solution**: Tailwind automatically purges unused styles in production builds. Run `npm run build` for optimized output.

**Issue**: Need custom SCSS features  
**Solution**: Add custom CSS in `src/styles/globals.css` using standard CSS or CSS-in-JS libraries if needed.
