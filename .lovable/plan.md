

## Fix: App broken due to duplicate MEDALS constant

### Problem
The app is completely non-functional right now because `VotingGallery.tsx` has a duplicate `const MEDALS` declaration (lines 34-44). This causes a `SyntaxError` that prevents the entire app from loading — which is why no one can log in.

A secondary issue: auth logs show rate-limiting (429 errors) for one IP address (`124.43.9.41`) hitting `/signup` repeatedly, but this affects only that specific client, not all users.

### Fix (single change)

**File: `src/components/VotingGallery.tsx`**
- Delete the duplicate `MEDALS` block on lines 40-44. Keep only the first declaration (lines 34-38).

No other files need changes. This will restore the app immediately.

### What this does NOT touch
- No changes to login, auth, profiles, votes, contestants, or edge functions.
- No database changes.

