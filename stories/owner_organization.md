# Story: Owner Organization Details (`/owner/organization`)

This document explains the end-to-end flow of the Owner Organization Settings screen, which allows business owners to manage company profiles, physical office coordinates (used for attendance boundary checks), and their personal owner profile details.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to specify my company details, bank account, and physical coordinates,  
> **So that** I can configure system settings and establish a geolocation boundary for employee clock-ins.

### The Journey:
1. **Accessing settings**: The Owner clicks the **Organization** tab. The UI retrieves company details from the cache or calls `GET /api/company/protected`.
2. **Reviewing Company Data**: The Owner inspects current parameters, including coordinates and boundary radius.
3. **Updating Location & Reverse Geocoding**:
   - The Owner can update coordinates by clicking **"Set my location as company location"**. The browser requests physical GPS coordinates, fetches details from OpenStreetMap (Nominatim API) to reverse geocode them into a text address, and populates the form.
   - Alternatively, they can type coordinates manually and click **"Resolve"** to reverse-lookup the street address.
4. **Saving Company Info**: On submission (`PUT /api/company/update`), the company schema is updated. The cache is bypassed, and a fresh fetch is fired to reload the view.
5. **Updating Owner Credentials**: The Owner can modify their personal details (address, bank account number) on the right card, which commits changes to the database via `PUT /api/users/profile`.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/organization/OwnerOrganization.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/organization/organizationSlice.js`
- **State Properties**:
  - `company`: Holds company settings (e.g. name, radius boundary).
  - `ownerProfile`: Details of the owning user.
  - `isCached`: Tracks if company settings are cached.
  - `ownerProfileIsCached`: Tracks if owner profile settings are cached.
- **Reducers**:
  - `setCompany(payload)`: Stores company configuration and sets `isCached = true`.
  - `setOwnerProfile(payload)`: Stores owner info and sets `ownerProfileIsCached = true`.
  - `invalidateCache()`: Clears cache flags.

### Geocoding Integrations:
- **OpenStreetMap Nominatim Reverse Lookup**:
  - URL: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}`
  - Used to convert GPS coordinates dynamically into a user-friendly street address in the form.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/company/protected` (Fetch Company profile details)
2. `PUT /api/company/update` (Update Company configuration, coordinates, boundary constraints)
3. `GET /api/users/info/:id` (Fetch Owner profile attributes)
4. `PUT /api/users/profile` (Update personal contact and banking credentials)

### Controller Details:
- **File**: `backend/src/controllers/companyController.js` and `backend/src/controllers/userController.js`

### Key Logical Processes:
- **Geolocation Boundary Check Prep**:
  - In `updateCompanyInfo`, coordinates are parsed as float values (`latitude`, `longitude`) along with `proximityRadius` (integer representing radius in meters).
  - Saving this record updates the company settings globally. Any subsequent clock-ins by employees will compute distances relative to these coordinates.

---

## 4. Database Collections Used

- **`Company`**: Stores corporate properties, GPS coordinates (`latitude`/`longitude`), and radius (`proximityRadius`).
- **`User`**: Stores owner credentials, banking account configurations, and contact information.
