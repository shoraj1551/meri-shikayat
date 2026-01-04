# PWA Icon Placement Script

## Quick Copy Commands

### Windows (PowerShell)
```powershell
# Create icons directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "client\public\icons"

# Copy generated icons from artifacts to public/icons
# Note: Replace the timestamp in filenames with actual generated file names

Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\app_icon_512_*.png" -Destination "client\public\icons\icon-512.png"
Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\app_icon_192_*.png" -Destination "client\public\icons\icon-192.png"
Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\app_icon_384_*.png" -Destination "client\public\icons\icon-384.png"
Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\shortcut_complaint_*.png" -Destination "client\public\icons\shortcut-complaint.png"
Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\shortcut_dashboard_*.png" -Destination "client\public\icons\shortcut-dashboard.png"
Copy-Item "C:\Users\SHORAJ TOMER\.gemini\antigravity\brain\4c137ee8-438e-44f1-a3dc-c3eaaaef1e71\shortcut_list_*.png" -Destination "client\public\icons\shortcut-list.png"
```

### For Missing Sizes (Use Online Tool)
Since we only generated 3 sizes (192, 384, 512), you need to create the remaining sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152

**Option 1**: Use https://realfavicongenerator.net/
1. Upload icon-512.png
2. Generate all sizes
3. Download and extract to client/public/icons/

**Option 2**: Use ImageMagick (if installed)
```powershell
# Resize 512px to all required sizes
magick client\public\icons\icon-512.png -resize 72x72 client\public\icons\icon-72.png
magick client\public\icons\icon-512.png -resize 96x96 client\public\icons\icon-96.png
magick client\public\icons\icon-512.png -resize 128x128 client\public\icons\icon-128.png
magick client\public\icons\icon-512.png -resize 144x144 client\public\icons\icon-144.png
magick client\public\icons\icon-512.png -resize 152x152 client\public\icons\icon-152.png
```

## Verification

After placing icons, verify:
```powershell
# List all icons
Get-ChildItem client\public\icons\

# Should see:
# icon-72.png
# icon-96.png
# icon-128.png
# icon-144.png
# icon-152.png
# icon-192.png
# icon-384.png
# icon-512.png
# shortcut-complaint.png
# shortcut-dashboard.png
# shortcut-list.png
```

## Test in Browser

1. Start dev server: `npm run dev`
2. Open http://localhost:3001
3. Open DevTools (F12) → Application → Manifest
4. Verify all icons load without 404 errors
5. Check icon preview shows correctly

✅ Task complete when all icons are in place and manifest loads without errors
