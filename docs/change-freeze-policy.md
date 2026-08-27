# Change Freeze Policy

## Release Candidate Freeze

After `v1.0.0-rc.1`:

- Do not add new features
- Allow only bug fixes
- Require retest evidence for every fix
- Update documentation when behavior changes
- Re-run build and relevant verification after each accepted fix

## Exception Policy

Exceptions are allowed only for:

- Critical outage
- Data integrity issue
- Security issue
- Verified evaluator-blocking workflow defect
