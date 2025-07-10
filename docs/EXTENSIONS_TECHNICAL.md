# AR.IO Gateway Extensions - Technical Documentation

## Overview

The AR.IO Gateway Extensions feature provides a discoverable marketplace for gateway operators to find and install modular tools and enhancements. This document covers the technical implementation and management of the Extensions system.

## Architecture

### File Structure

```
/src/pages/Extensions/
├── Extensions.tsx      # Main page component with search/filter
├── ExtensionCard.tsx   # Card component for list view
└── ExtensionDetail.tsx # Detail view component

/src/types/
└── extension.ts        # TypeScript types for extensions

/public/data/
└── extensions.json     # Extension registry data
```

### Data Model

Extensions are defined with the following TypeScript interface:

```typescript
interface Extension {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Short description (shown in list)
  longDescription: string; // Full description (shown in detail)
  author: string; // Extension author/organization
  authorUrl?: string; // Optional author website
  url: string; // Repository/website URL
  category: ExtensionCategory; // Category enum
  tags: ExtensionTag[]; // Array of tags
  version: string; // Current version
  lastUpdated: string; // ISO date string
  minGatewayVersion?: string; // Minimum gateway version required
  documentation?: string; // Optional docs URL
  image?: string; // Logo image (Arweave TX ID or HTTPS URL)
  screenshots?: string[]; // Screenshot images (Arweave TX IDs or HTTPS URLs)
}
```

### Categories

- `storage` - Storage and backup solutions
- `routing` - Request routing and load balancing
- `monitoring` - Performance monitoring and analytics
- `security` - Security and protection features
- `performance` - Performance optimization
- `indexing` - Content indexing and search
- `caching` - Caching strategies
- `moderation` - Content moderation tools
- `analytics` - Analytics and reporting
- `developer-tools` - Development and debugging tools

### Tags

- `featured` - Highlighted extensions
- `grant-funded` - Received AR.IO grants
- `community` - Community contributed
- `official` - Official AR.IO extensions
- `beta` - Beta/experimental
- `stable` - Production ready

## Managing extensions.json

### Location

The extension registry is stored in `/public/data/extensions.json`

### Adding a New Extension

1. Open `/public/data/extensions.json`
2. Add a new extension object to the `extensions` array:

```json
{
  "id": "unique-extension-id",
  "name": "Extension Display Name",
  "description": "Short description for the card view",
  "longDescription": "Detailed description explaining features, benefits, and use cases...",
  "author": "Author Name",
  "authorUrl": "https://author-website.com",
  "url": "https://github.com/author/extension-repo",
  "category": "monitoring",
  "tags": ["community", "stable"],
  "version": "1.0.0",
  "lastUpdated": "2025-01-10",
  "minGatewayVersion": "2.0.0",
  "documentation": "https://docs.example.com/extension",
  "image": "Xq7YPvD1-KqfN8XYo4NMlYgg-XTPcj-j1XHNPGQD5vM",
  "screenshots": ["screenshot-tx-id-1", "screenshot-tx-id-2"]
}
```

### Guidelines for Extension Entries

1. **ID**: Use kebab-case, must be unique
2. **Name**: Clear, descriptive name (3-5 words max)
3. **Description**: One-line summary (under 100 characters)
4. **Long Description**: 2-3 sentences explaining the extension
5. **Categories**: Choose the most appropriate single category
6. **Tags**:
   - Use `featured` sparingly for high-impact extensions
   - Include `grant-funded` only if officially funded
   - Add `beta` for experimental features
   - Use `stable` for production-ready extensions
7. **Version**: Follow semantic versioning (MAJOR.MINOR.PATCH)
8. **Last Updated**: Use ISO date format (YYYY-MM-DD)
9. **Image**:
   - Recommended size: 256x256px (PNG with transparency preferred)
   - Can be Arweave TX ID or HTTPS URL
   - Falls back to gradient placeholder if not provided
10. **Screenshots**:

- Recommended size: 1280x800px
- Array of Arweave TX IDs or HTTPS URLs
- Maximum 3-5 screenshots recommended

### Validation Checklist

Before adding an extension:

- [ ] Verify the repository/URL is accessible
- [ ] Ensure the extension is relevant to AR.IO gateways
- [ ] Check for duplicate functionality
- [ ] Validate all required fields are present
- [ ] Test that JSON is valid (no syntax errors)
- [ ] Confirm category and tags are appropriate

### Example Pull Request for Adding Extensions

```markdown
Title: Add [Extension Name] to Extensions Registry

Description:

- Added [Extension Name] by [Author]
- Category: [category]
- Tags: [tags]
- Functionality: [brief description]

Checklist:

- [ ] JSON is valid
- [ ] All required fields included
- [ ] Repository is public and accessible
- [ ] Extension tested with AR.IO gateway
```

## Development

### Local Testing

1. Start the dev server: `yarn dev`
2. Navigate to `http://localhost:5173/#/extensions`
3. Verify new extensions appear correctly
4. Test search and filtering
5. Check detail view renders properly

### Styling Guidelines

The Extensions feature uses the existing design system:

- Dark theme with containerL0/L1/L2/L3 backgrounds
- Gradient effects for emphasis
- Consistent spacing (gap-6, p-6)
- Responsive grid layout

### Future Enhancements

Potential improvements for future versions:

- API endpoint for dynamic extension loading
- Installation count tracking
- User ratings and reviews
- Automated extension validation
- One-click installation (when CLI tools available)
- Extension screenshots in detail view

## Image Management

### Image URL Resolution

The `getImageUrl` utility function handles both Arweave transaction IDs and HTTPS URLs:

```typescript
// Arweave TX ID
"image": "Xq7YPvD1-KqfN8XYo4NMlYgg-XTPcj-j1XHNPGQD5vM"
// Resolves to: /Xq7YPvD1-KqfN8XYo4NMlYgg-XTPcj-j1XHNPGQD5vM (on gateways)
// Or: https://arweave.net/Xq7YPvD1-KqfN8XYo4NMlYgg-XTPcj-j1XHNPGQD5vM (centralized)

// HTTPS URL
"image": "https://example.com/logo.png"
// Used as-is
```

### Uploading Images to Arweave

```bash
# Using arkb
arkb deploy logo.png --wallet wallet.json

# Using arweave-deploy
arweave deploy logo.png --key-file wallet.json
```

### Image Guidelines

**Logo/Icon:**

- Size: 256x256px (displays at 48x48px on cards)
- Format: PNG with transparency
- Ensure good contrast on dark backgrounds

**Screenshots:**

- Size: 1280x800px
- Format: PNG or JPG
- Show actual extension UI
- Avoid sensitive information

### Fallback Behavior

When no image is provided or loading fails:

- Cards display a gradient placeholder with the first letter
- Gradient color based on extension category
- Maintains visual consistency

## Deployment

The extensions.json file is served statically from the public directory. Updates require:

1. Modifying the JSON file
2. Creating a PR with changes
3. Deployment through standard CI/CD pipeline

No additional infrastructure or configuration needed.
