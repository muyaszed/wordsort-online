# Branch Protection — main

Apply these settings to the `main` branch via GitHub Settings → Branches → Branch protection rules:

- **Require status checks before merging:** ✅
  - `Lint`
  - `Type Check`
  - `Test`
  - `Build`
- **Require branches to be up to date before merging:** ✅
- **Require a pull request before merging:** ✅
  - Required approvals: **1**
- **Restrict pushes that create files:** ✅ (admin only)
- **Do not allow bypassing the above settings:** ✅ (optional, recommended for strict teams)
