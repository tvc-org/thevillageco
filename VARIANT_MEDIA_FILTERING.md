# Variant-Based Media Filtering

This implementation allows you to show/hide product media based on the selected variant using delimiters in the alt text.

## How It Works

The system looks for variant names in the alt text of product images and filters the media gallery to only show images that match the currently selected variant.

## Usage

### 1. Add Variant Names to Alt Text

When uploading product images, include the variant name in the alt text using one of these delimiters:

- `|` (pipe)
- `*` (asterisk) 
- `:` (colon)
- `;` (semicolon)
- `~` (tilde)

### 2. Alt Text Examples

**Single variant:**
```
Product image showing blue color | Blue
```

**Multiple variants:**
```
Product image showing both colors | Blue | Red
```

**With SEO-friendly description:**
```
Beautiful product shot in natural lighting showing the premium quality | Blue
```

**Multiple variants with description:**
```
Product lifestyle image showing versatility | Small | Medium | Large
```

### 3. How the Filtering Works

- The system automatically detects which delimiter you're using
- It extracts variant names from the alt text
- When a variant is selected, it shows only images that contain that variant name
- Images without variant names in alt text are always shown (fallback behavior)
- The filtering works for both the main gallery and the modal view

### 4. Supported Delimiters

You can use any of these delimiters:
- `|` - Most common choice
- `*` - Good for technical users
- `:` - Natural separator
- `;` - Alternative option
- `~` - Unique choice

### 5. Best Practices

1. **Be consistent** - Use the same delimiter across all your products
2. **Include SEO text** - Add descriptive alt text before the delimiter
3. **Use exact variant names** - Match the variant names exactly as they appear in your product options
4. **Test thoroughly** - Verify filtering works with your specific variant names

### 6. Example Workflow

1. Create a product with variants (e.g., Color: Blue, Red, Green)
2. Upload images for each variant
3. Set alt text like:
   - Image 1: "Blue product shot | Blue"
   - Image 2: "Red product shot | Red" 
   - Image 3: "Green product shot | Green"
   - Image 4: "Product packaging | Blue | Red | Green"
4. When customers select "Blue", only images 1 and 4 will show
5. When customers select "Red", only images 2 and 4 will show

### 7. Fallback Behavior

- Images without delimiters in alt text are always shown
- If no delimiter is found in any image, no filtering occurs
- The system gracefully handles missing or malformed alt text

## Technical Details

The filtering logic is centralized in `assets/global.js` as the `filterMediaByVariant()` function and is called from:

1. `assets/product-info.js` - Handles filtering when variants change
2. `assets/media-gallery.js` - Handles filtering on initial page load

The system is designed to be non-intrusive and will only filter when variant names are properly marked in alt text. 