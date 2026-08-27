# UI Consistency Audit

## Fixed In This Pass

- Dashboard doctor availability panel now uses backend summary data
- Dashboard notification summary now uses backend summary data
- Demo mode and presentation surfaces follow current card and shell styling

## Observations

- Core routed pages generally follow shared `PageHeader`, card radius, and button styling
- Some non-routed legacy shell pages in `ModulePages.jsx` still contain old placeholder language
- Build passes without route breakage, which reduces immediate release risk

## Remaining Review Items

- Verify every sidebar item manually in browser
- Check mobile and tablet rendering across queue, consultation, and reports
- Review Tamil text wrapping in narrow layouts
- Confirm empty and error states across every role page
