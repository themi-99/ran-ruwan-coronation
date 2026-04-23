

## Increase Normal Vote Limit from 1 to 2 per Category

### What changes
Two constants updated from `1` to `2`:

**1. `supabase/functions/cast-vote/index.ts`** — line 10
- Change `NORMAL_LIMIT = 1` → `NORMAL_LIMIT = 2`
- This is the server-side enforcement. The edge function will be redeployed automatically.

**2. `src/components/VotingGallery.tsx`** — line 29
- Change `NORMAL_LIMIT = 1` → `NORMAL_LIMIT = 2`
- This controls the UI (button disable state, "Limit" text).

### What stays the same
- Judge scoring (Gold/Silver/Bronze) — untouched
- `JUDGE_LIMIT = 5` — remains but is only used if a judge casts regular votes (which they don't in current flow)
- Database schema — no changes
- Duplicate vote check — users still cannot vote for the same contestant twice
- Honorary contestant logic — unchanged

### Effect on existing users
- Users who already cast 1 vote in a category can now cast 1 more
- Users who haven't voted yet get 2 votes per category
- No data is lost or modified

### Risk level
**Very low.** Two constant changes, no structural modifications. Edge function redeploy takes ~10 seconds.

