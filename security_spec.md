# Security Specification: MY WORLD

## Data Invariants & Access Models
1. **Public Reading of Published Content**:
   - Songs, Artists, Albums, Collections, Gallery items, Quotes, and Settings are readable by any client IF `resource.data.isPublished == true`.
   - Admin (`mostafahessein695@gmail.com` or documents in `/admins/{uid}`) can read both published and draft (unpublished) items.
2. **Admin-Exclusive Writes**:
   - Only authenticated admin users (`isAdmin()`) can create, update, or delete songs, artists, albums, collections, gallery items, quotes, and site settings.
3. **Admin Verification**:
   - User must be authenticated (`request.auth != null`) and have verified email (`request.auth.token.email_verified == true`).
   - Admin email is bootstrapped to `mostafahessein695@gmail.com` or verified against `/admins/$(request.auth.uid)`.
4. **Validation Blueprints**:
   - Every write operation enforces schema constraints (e.g., maximum string lengths, required keys, correct types).
5. **No Blanket Reads**:
   - Collections strictly enforce public read on `isPublished == true` or admin access, preventing unpublished draft leaks.

## Dirty Dozen Payloads Handled
1. Unauthenticated write to `/songs/new_track` -> Rejected (Missing Auth).
2. Authenticated non-admin write to `/songs/track_1` -> Rejected (Not Admin).
3. Admin update inserting unbounded 50MB payload -> Rejected (Size bounds exceeded).
4. Public user attempting to list unpublished drafts (`isPublished == false`) -> Denied.
5. Injected invalid document ID containing path traversal characters -> Denied by `isValidId()`.
6. Self-assigned admin role in `/admins/` by non-admin -> Denied.
7. Attempted deletion of site settings by non-admin -> Denied.
8. Unverified email spoofing admin -> Denied (`email_verified` check).
