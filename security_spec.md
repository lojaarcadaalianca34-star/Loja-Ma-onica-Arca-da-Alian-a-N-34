# Security Spec for Leads

## Data Invariants
- A lead must have a valid email and phone.
- A lead must have a name (either `name` or `fullName`).
- `createdAt` must be set to the server time.
- Quest leads must have a `type` field set to `masonic_quest`.

## The "Dirty Dozen" Payloads (Expected to Fail)
1. Missing email: `{ "phone": "123", "name": "Test", "createdAt": "server" }`
2. Invalid name type: `{ "email": "a@b.com", "phone": "123", "name": 123, "createdAt": "server" }`
3. Spoofed createdAt: `{ "email": "a@b.com", "phone": "123", "name": "Test", "createdAt": "2020-01-01" }`
4. Too many fields (Resource Exhaustion): `{ ... 100 random fields ... }`
5. Missing phone: `{ "email": "a@b.com", "name": "Test", "createdAt": "server" }`
6. Invalid type in Quest: `{ "type": "wrong", "fullName": "Test", "email": "a@b.com", "phone": "123", "createdAt": "server" }`
7. Quest missing fullName: `{ "type": "masonic_quest", "email": "a@b.com", "phone": "123", "createdAt": "server" }`
8. Incomplete structure: `{ "email": "a@b.com" }`
9. Trying to set isAdmin: `{ "email": "a@b.com", "phone": "123", "name": "Test", "createdAt": "server", "isAdmin": true }`
10. Massive string in field: `{ "email": "a@b.com", "phone": "123", "name": "Very long string...", "createdAt": "server" }`
11. Invalid type field for basic lead: `{ "type": "some_other", "name": "Test", "email": "a@b.com", "phone": "123", "createdAt": "server" }`
12. Attempting to write to /admins as public user.

## Proposed Rules Logic
```javascript
function isValidLead(data) {
  let hasCommon = data.keys().hasAll(['email', 'phone', 'createdAt']) &&
                  data.email is string && data.email.size() < 200 &&
                  data.phone is string && data.phone.size() < 50 &&
                  data.createdAt == request.time;
  
  let isBasic = data.keys().hasAll(['name']) && 
                data.name is string && data.name.size() < 200 &&
                data.keys().size() <= 6;
                
  let isQuest = data.keys().hasAll(['fullName', 'type']) && 
                data.fullName is string && data.fullName.size() < 200 &&
                data.type == 'masonic_quest' &&
                data.keys().size() <= 25;

  return hasCommon && (isBasic || isQuest);
}
```
