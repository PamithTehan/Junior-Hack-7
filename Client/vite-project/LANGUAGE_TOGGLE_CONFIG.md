# Language Toggle Configuration Guide

The LanguageToggle component is now fully configurable with multiple options for customization.

## Basic Usage

```jsx
import LanguageToggle from './Components/Common/LanguageToggle';

// Default usage (recommended)
<LanguageToggle />
```

## Configuration Options

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'minimal' \| 'icon-only'` | `'default'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button and dropdown size |
| `position` | `'left' \| 'right'` | `'right'` | Dropdown menu position |
| `showFlags` | `boolean` | `true` | Show flag emojis |
| `showNames` | `boolean` | `true` | Show language names |

## Examples

### Default Button (Recommended)
```jsx
<LanguageToggle />
```
Shows flag + language name, default size, right-aligned dropdown.

### Minimal Style
```jsx
<LanguageToggle variant="minimal" />
```
Transparent background with border, perfect for subtle integration.

### Icon Only (Compact)
```jsx
<LanguageToggle variant="icon-only" />
```
Shows only a globe icon, ideal for space-constrained areas.

### Small Size
```jsx
<LanguageToggle size="sm" />
```
Compact button for mobile or tight spaces.

### Large Size
```jsx
<LanguageToggle size="lg" />
```
Larger button for prominent placement.

### Left-Aligned Dropdown
```jsx
<LanguageToggle position="left" />
```
Dropdown opens to the left instead of right.

### Without Flags
```jsx
<LanguageToggle showFlags={false} />
```
Hides flag emojis, shows only language names.

### Without Names
```jsx
<LanguageToggle showNames={false} />
```
Hides language names, shows only flags (or icon if flags also hidden).

### Combined Configuration
```jsx
<LanguageToggle 
  variant="minimal"
  size="sm"
  position="left"
  showFlags={true}
  showNames={false}
/>
```

## Features

✅ **Full Keyboard Navigation**
- Arrow keys to navigate
- Enter/Space to select
- Escape to close

✅ **Accessibility**
- ARIA labels and roles
- Screen reader support
- Focus management

✅ **Responsive Design**
- Mobile-friendly backdrop
- Adaptive sizing
- Touch-friendly targets

✅ **Google Translate Integration**
- Automatic page translation
- Route change handling
- Dynamic content support

✅ **Dark Mode Support**
- Automatic theme adaptation
- Consistent styling

## Styling Customization

The component uses Tailwind CSS classes. You can override styles by:

1. **Using variant prop** - Choose from predefined styles
2. **Wrapping in a styled container** - Apply custom classes to parent
3. **CSS overrides** - Target component classes in your CSS

## Integration Examples

### In Navbar (Desktop)
```jsx
<div className="flex items-center space-x-2">
  <LanguageToggle variant="default" size="md" />
  <ThemeToggle />
</div>
```

### In Navbar (Mobile)
```jsx
<div className="flex items-center space-x-2">
  <LanguageToggle variant="icon-only" size="sm" />
</div>
```

### In Footer
```jsx
<LanguageToggle variant="minimal" size="sm" position="left" />
```

### In Settings Panel
```jsx
<div className="space-y-4">
  <h3>Language Settings</h3>
  <LanguageToggle size="lg" />
</div>
```

## Current Languages

- 🇬🇧 **English** (en)
- 🇱🇰 **සිංහල** (si) - Sinhala
- 🇱🇰 **தமிழ்** (ta) - Tamil

## Notes

- The component automatically integrates with Google Translate
- Language preference is saved in localStorage
- Translations persist across page navigation
- Works with React Router route changes

