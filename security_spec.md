# Bigboss Law Security Specification & Invariants

## 1. Data Invariants
1. **Admin Authorization Gate**: Only authorized system administrators (identified in `/admins/{uid}` or authenticated staff with `roleId == 'admin'`) can create, update, or assign roles/permissions to any staff member.
2. **Anti-Privilege Escalation**: Non-admin users are strictly forbidden from modifying `roleId`, `role`, or `permissions` fields on their own staff documents or any other staff documents.
3. **Identity Verification & Anti-Spoofing**: Users cannot create or update audit logs, internal notes, or documents masquerading as another user.
4. **Client & Case Integrity**: Legal cases must reference valid non-empty IDs. Case deletion is restricted to authorized roles (Admins and Partner Lawyers).
5. **PII and Confidentiality Guard**: Confidential internal notes (`isConfidential == true`) cannot be read by suspended accounts or unauthorized roles.
6. **Task & Milestone Consistency**: Assigned tasks and timelines must point to valid case identifiers.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Privilege Escalation via Staff Update**: Non-admin attempting to set `roleId: "admin"` and `permissions: ["manage_users_roles"]`.
2. **Unauthorized Staff Deletion**: Associate lawyer attempting to delete a partner lawyer record.
3. **Ghost Field Injection in Case**: Injected unauthorized hidden fields (`_backdoorKey: true`) bypassing validation.
4. **Unauthenticated Read of Internal Notes**: Unauthenticated client attempting to list `/notes`.
5. **Self-Granting System Settings Access**: Paralegal attempting to overwrite `/settings/firm_config`.
6. **Id Poisoning Attack**: Attempting to write document with 2KB string identifier containing special characters.
7. **Client Deletion by Associate Lawyer**: Attempting to purge a client document without admin or partner permissions.
8. **Malicious Task Status Flip with Tampered Fields**: Contributor modifying tasks but altering immutable case reference or assignee.
9. **Fake Audit Log Forgery**: Contributor writing an audit log claiming actorName is "LS. Điều Hành BigBoss" with spoofed UID.
10. **Tampered Billing Overwrite**: Paralegal directly wiping pendingAmount or resetting fee structures.
11. **Direct Modification of `/admins/{uid}`**: Non-admin user trying to create a document in `/admins/{uid}` to elevate rights.
12. **Blanket Query Scraping**: Malicious query retrieving all documents without proper role clearance.

## 3. Test Runner Design
All tests in `firestore.rules.test.ts` assert that operations attempting to break the above invariants return `PERMISSION_DENIED`.
