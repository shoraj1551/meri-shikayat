# P0 Critical Tasks - Execution Guide

**Status**: Ready to execute  
**Timeline**: Today (3-4 hours)  
**Goal**: Complete all P0 tasks

---

## Task 1: Place PWA Icons ✅ READY

**Time**: 30 minutes  
**Priority**: CRITICAL

### Steps:
1. Open PowerShell in project root
2. Run commands from `ICON_PLACEMENT.md`
3. Verify icons in `client/public/icons/`
4. Test in browser DevTools

### Commands:
```powershell
cd c:\Users\SHORAJ TOMER\Meri_Shikayat\meri-shikayat
# Follow ICON_PLACEMENT.md
```

---

## Task 2: Run Lighthouse Audit ⏳ NEXT

**Time**: 1 hour  
**Priority**: HIGH

### Prerequisites:
- Dev server running
- Icons placed

### Steps:
1. Install Lighthouse:
```powershell
npm install -g lighthouse
```

2. Start dev server:
```powershell
cd client
npm run dev
```

3. Run Lighthouse (in new terminal):
```powershell
lighthouse http://localhost:3001 --output html --output-path ./lighthouse-report.html --view
```

### Target Scores:
- Performance: ≥ 90
- Accessibility: 100
- Best Practices: ≥ 90
- SEO: ≥ 90
- PWA: ≥ 90

### If Scores Low:
- Check console for errors
- Optimize images
- Minify CSS/JS
- Fix accessibility issues

---

## Task 3: Cross-Browser Testing ⏳ PENDING

**Time**: 2 hours  
**Priority**: HIGH

### Browsers to Test:
1. ✅ Chrome (primary development)
2. ⏳ Firefox
3. ⏳ Safari (if on Mac)
4. ⏳ Edge

### Test Cases:
For each browser, test:
- [ ] Homepage loads
- [ ] Login (all 4 user types)
- [ ] Register
- [ ] File complaint
- [ ] View complaints
- [ ] PWA install prompt
- [ ] Offline mode

### Document Issues:
Create `cross-browser-issues.md` with:
- Browser name
- Issue description
- Screenshot
- Severity (Critical/High/Medium/Low)

---

## Task 4: Accessibility Testing ⏳ PENDING

**Time**: 2 hours  
**Priority**: HIGH

### Automated Testing:
```powershell
# Install pa11y
npm install -g pa11y

# Run accessibility audit
pa11y http://localhost:3001
```

### Manual Testing:
1. **Keyboard Navigation**:
   - Tab through all elements
   - Verify focus indicators
   - Test form submission with Enter

2. **Screen Reader** (Optional):
   - Windows: NVDA (free)
   - Mac: VoiceOver (built-in)
   - Test navigation
   - Verify labels read correctly

3. **Color Contrast**:
   - Use browser DevTools
   - Check all text has ≥ 4.5:1 contrast

### WCAG 2.1 AA Checklist:
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Color contrast sufficient
- [ ] Keyboard accessible
- [ ] No keyboard traps
- [ ] Skip navigation links
- [ ] ARIA labels present

---

## Task 5: Deploy to Staging ⏳ PENDING

**Time**: 2 hours  
**Priority**: HIGH

### Prerequisites:
- All above tasks complete
- Staging server set up
- Environment variables configured

### Steps:

1. **Build Production Bundle**:
```powershell
cd client
npm run build
```

2. **Test Build Locally**:
```powershell
npm run preview
```

3. **Deploy to Staging**:
```powershell
# Option 1: Vercel
vercel --prod

# Option 2: Netlify
netlify deploy --prod

# Option 3: Manual
# Copy dist/ to staging server
```

4. **Configure Environment**:
```env
NODE_ENV=staging
VITE_API_URL=https://staging-api.merishikayat.com
```

5. **Smoke Test**:
- [ ] Visit staging URL
- [ ] Test login
- [ ] Test file complaint
- [ ] Test admin access
- [ ] Check console for errors

---

## Task 6: Final QA Testing ⏳ PENDING

**Time**: 2-3 hours  
**Priority**: HIGH

### Test All User Flows:

**General User**:
1. Register → Verify email → Login
2. File complaint → View complaints
3. Edit complaint → Delete complaint
4. View profile → Edit profile

**Admin**:
1. Login → View dashboard
2. View all complaints
3. Assign complaint to contractor
4. Update complaint status

**Contractor**:
1. Login → View dashboard
2. View assigned jobs
3. Update job progress

**Super Admin**:
1. Login → Full system access
2. Manage users
3. View analytics

### Document Results:
Create `qa-test-results.md` with:
- Test case
- Status (Pass/Fail)
- Issues found
- Screenshots

---

## Progress Tracking

### Completed:
- [x] Created execution guide
- [x] Created icon placement script
- [x] Created testing package.json

### Today's Goals:
- [ ] Place PWA icons (30 min)
- [ ] Run Lighthouse audit (1 hour)
- [ ] Cross-browser testing (2 hours)
- [ ] Accessibility testing (2 hours)

### Tomorrow's Goals:
- [ ] Deploy to staging (2 hours)
- [ ] Final QA testing (2-3 hours)

---

## Success Criteria

All P0 tasks complete when:
- ✅ All PWA icons in place
- ✅ Lighthouse scores ≥ 90
- ✅ Works on all browsers
- ✅ WCAG 2.1 AA compliant
- ✅ Deployed to staging
- ✅ All QA tests pass

---

## Next Steps After P0

Once P0 complete:
1. Start P1 tasks (responsive testing)
2. API documentation
3. E2E tests
4. Production deployment

---

**Ready to start**: Place PWA icons now!  
**Estimated completion**: End of today (if started now)
