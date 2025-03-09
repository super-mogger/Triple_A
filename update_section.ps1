$readmeContent = Get-Content -Path "README.md" -Raw

$sectionToAdd = @"

## Latest Updates (March 1, 2024)

- **Member Verification System**: Added ability to verify member identities with visual indicators
- **Aadhaar Card Management**: Enhanced document capture and storage for member verification
- **Profile Data Synchronization**: Improved data flow between admin app and main member app
- **Profile Photo Management**: Admins can now update member profile photos that sync to authentication

"@

$updatedContent = $readmeContent -replace "(?s)# TripleA-Admin.*?## Project Overview", "# TripleA-Admin`r`n`r`nA Firebase-powered admin dashboard for gym/fitness center management with authentication, membership tracking, and attendance management.$sectionToAdd`r`n## Project Overview"

$updatedContent | Set-Content -Path "README.md" 