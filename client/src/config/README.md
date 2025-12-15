# Contact Information Configuration

## 📝 How to Update Contact Information

All contact information (email, phone, address, social media, hours) is centralized in **ONE FILE** for easy management.

### Configuration File Location
```
client/src/config/contact-info.json
```

### How to Update

1. **Open the file**: `client/src/config/contact-info.json`

2. **Edit the values** you want to change:

```json
{
  "contact": {
    "email": {
      "primary": "support@merishikayat.in",    ← Change this
      "support": "help@merishikayat.in",       ← Change this
      "admin": "admin@merishikayat.in"         ← Change this
    },
    "phone": {
      "primary": "+91 123 456 7890",           ← Change this
      "helpline": "+91 987 654 3210",          ← Change this
      "tollfree": "1800-123-4567"              ← Change this
    },
    "address": {
      "line1": "Meri Shikayat Office",         ← Change this
      "line2": "123 Civic Center",             ← Change this
      "city": "New Delhi",                     ← Change this
      "state": "Delhi",                        ← Change this
      "pincode": "110001",                     ← Change this
      "country": "India"                       ← Change this
    },
    "social": {
      "facebook": "https://facebook.com/...",  ← Change this
      "twitter": "https://twitter.com/...",    ← Change this
      "instagram": "https://instagram.com/...", ← Change this
      "linkedin": "https://linkedin.com/..."   ← Change this
    },
    "hours": {
      "weekdays": "9:00 AM - 6:00 PM",         ← Change this
      "saturday": "10:00 AM - 4:00 PM",        ← Change this
      "sunday": "Closed"                       ← Change this
    }
  }
}
```

3. **Save the file**

4. **Refresh the website** - Changes will appear automatically!

### Where This Information Appears

The contact information from this file automatically updates:
- ✅ Contact Page (`/contact`)
- ✅ Footer (all pages)
- ✅ Homepage
- ✅ Any other page that displays contact info

### Example: Changing Phone Number

**Before**:
```json
"phone": {
  "primary": "+91 123 456 7890"
}
```

**After**:
```json
"phone": {
  "primary": "+91 999 888 7777"
}
```

**Result**: The new number `+91 999 888 7777` will appear everywhere automatically!

### Important Notes

⚠️ **JSON Format Rules**:
- Keep the structure intact (don't remove commas or brackets)
- Use double quotes `"` for text
- Don't add trailing commas after the last item
- Validate JSON format if unsure: https://jsonlint.com/

✅ **Best Practices**:
- Update all related fields together
- Test the contact page after changes
- Keep backup of original file

### Need Help?

If you encounter any issues:
1. Check JSON syntax (use jsonlint.com)
2. Ensure all quotes and commas are correct
3. Restart the development server if changes don't appear

---

**That's it!** One file to update, changes everywhere. 🎉
