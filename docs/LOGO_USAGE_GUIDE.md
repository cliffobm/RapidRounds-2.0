# RapidRounds Logo Usage Guide

## 🎨 **Available Logo Variations**

### **1. Original Logo** (`rapidrounds-logo.svg`)
- **Size:** 220x60px
- **Use:** Main header, navigation, standard layouts
- **Theme:** Light background

### **2. Horizontal Logo** (`rapidrounds-logo-horizontal.svg`)
- **Size:** 280x80px
- **Use:** Wide headers, marketing materials, presentations
- **Features:** Includes tagline "Medical Education Platform"

### **3. Vertical Logo** (`rapidrounds-logo-vertical.svg`)
- **Size:** 120x140px
- **Use:** Sidebars, mobile navigation, compact spaces
- **Features:** Stacked text layout

### **4. Icon Logo** (`rapidrounds-logo-icon.svg`)
- **Size:** 64x64px
- **Use:** App icons, social media, favicons
- **Features:** Circular background, simplified design

### **5. Favicon** (`rapidrounds-logo-favicon.svg`)
- **Size:** 32x32px
- **Use:** Browser tabs, bookmarks
- **Features:** Minimalist design for small sizes

### **6. Monochrome Logo** (`rapidrounds-logo-monochrome.svg`)
- **Size:** 220x60px
- **Use:** Single-color printing, dark themes
- **Features:** Grayscale version

### **7. Dark Theme Logo** (`rapidrounds-logo-dark.svg`)
- **Size:** 220x60px
- **Use:** Dark backgrounds, night mode
- **Features:** Light text on dark background

## 🚀 **Implementation Examples**

### **React/Next.js Components**

```tsx
import Image from 'next/image'

// Main header logo
<Image 
  src="/brand/rapidrounds-logo.svg" 
  alt="RapidRounds" 
  width={220} 
  height={60}
  className="h-12 w-auto"
/>

// Horizontal logo with tagline
<Image 
  src="/brand/rapidrounds-logo-horizontal.svg" 
  alt="RapidRounds - Medical Education Platform" 
  width={280} 
  height={80}
  className="h-16 w-auto"
/>

// Icon for mobile
<Image 
  src="/brand/rapidrounds-logo-icon.svg" 
  alt="RapidRounds" 
  width={64} 
  height={64}
  className="h-12 w-12"
/>

// Dark theme logo
<Image 
  src="/brand/rapidrounds-logo-dark.svg" 
  alt="RapidRounds" 
  width={220} 
  height={60}
  className="h-12 w-auto dark:block hidden"
/>
```

### **CSS Classes for Responsive Design**

```css
/* Logo sizing classes */
.logo-main { width: 220px; height: 60px; }
.logo-horizontal { width: 280px; height: 80px; }
.logo-vertical { width: 120px; height: 140px; }
.logo-icon { width: 64px; height: 64px; }
.logo-favicon { width: 32px; height: 32px; }

/* Responsive logo sizing */
@media (max-width: 768px) {
  .logo-main { width: 180px; height: 49px; }
  .logo-horizontal { width: 220px; height: 63px; }
}

@media (max-width: 480px) {
  .logo-main { width: 150px; height: 41px; }
  .logo-horizontal { width: 180px; height: 51px; }
}
```

### **HTML Favicon Implementation**

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/brand/rapidrounds-logo-favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/brand/rapidrounds-logo-favicon.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/brand/rapidrounds-logo-favicon-16x16.png" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/brand/rapidrounds-logo-icon.png" />

<!-- Manifest -->
<link rel="manifest" href="/site.webmanifest" />
```

## 🎯 **Usage Guidelines**

### **Do's:**
- ✅ Use the appropriate logo for the context
- ✅ Maintain proper spacing around the logo
- ✅ Keep the logo proportional when resizing
- ✅ Use high contrast versions for accessibility
- ✅ Test logos on different backgrounds

### **Don'ts:**
- ❌ Don't stretch or distort the logo
- ❌ Don't change the colors (except for monochrome version)
- ❌ Don't add effects like shadows or outlines
- ❌ Don't use low-resolution versions
- ❌ Don't place logos on busy backgrounds

## 📱 **Responsive Usage**

### **Desktop (1200px+)**
- Use horizontal logo with tagline
- Size: 280x80px

### **Tablet (768px - 1199px)**
- Use standard logo
- Size: 220x60px

### **Mobile (320px - 767px)**
- Use icon logo or compact standard logo
- Size: 64x64px or 150x41px

## 🌙 **Theme Support**

### **Light Theme**
- Use standard logo (`rapidrounds-logo.svg`)
- Use monochrome version for single-color needs

### **Dark Theme**
- Use dark theme logo (`rapidrounds-logo-dark.svg`)
- Ensure proper contrast ratios

## 🖨️ **Print Guidelines**

### **Color Printing**
- Use standard logo with full colors
- Ensure CMYK color accuracy

### **Black & White Printing**
- Use monochrome version
- Test contrast on different paper types

## 📊 **File Formats**

### **SVG (Recommended)**
- Scalable vector graphics
- Perfect for web use
- Small file sizes
- Crisp at any resolution

### **PNG (Fallback)**
- Raster graphics
- Use for favicons and app icons
- Larger file sizes
- Fixed resolution

## 🔧 **Technical Notes**

- All logos are optimized for web use
- SVG files include proper viewBox attributes
- Gradients are defined for consistent rendering
- Text uses system fonts (Inter, system-ui, sans-serif)
- Icons are designed for readability at small sizes
