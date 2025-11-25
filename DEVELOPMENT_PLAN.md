# Character Creator - Development Plan

## 🎉 PROJECT STATUS: MVP COMPLETE & FUNCTIONAL!

**Current Phase:** Phases 1-5 Complete ✅ | Ready for Testing & Polish  
**Build Status:** ✅ Production build working (458KB single file)  
**Dev Server:** ✅ Running at http://localhost:5173  
**Test Status:** ✅ 28 unit tests passing  

> **See [PHASE_4_COMPLETE.md](./PHASE_4_COMPLETE.md) for detailed completion report!**

---

## Project Overview
Build a React-based TTRPG character sheet that is completely self-contained in a single `index.html` file with embedded state management, version history, and import/export capabilities.

---

## Phase 1: Foundation & Setup ✅ COMPLETE

### 1.1 Project Dependencies ✅
**Status:** ✅ Complete
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS configuration
- [x] shadcn/ui components (9 components installed)
- [x] Add Zod for schema validation
- [x] Add vitest for testing
- [x] Configure build process for single-file output

**Completed:**
1. ✅ Installed Zod 4.1.13
2. ✅ Installed vitest 4.0.13 and testing utilities
3. ✅ Configured vite-plugin-singlefile 2.3.0
4. ✅ Build produces 458KB single HTML file

### 1.2 Build Configuration ✅
**Goal:** Configure Vite to produce a single self-contained HTML file

**Completed:**
1. ✅ Installed vite-plugin-singlefile
2. ✅ All CSS, JS, and assets inlined into HTML
3. ✅ Build output verified: `dist/index.html` (458KB)
4. ✅ npm scripts created: `build`, `test`, `dev`

---

## Phase 2: Data Architecture ✅ COMPLETE

### 2.1 Type Definitions & Enums ✅
**File:** `src/types/character.types.ts` (205 lines)

**Completed:**
1. ✅ Species enum (8 species)
2. ✅ CharacterClass enum (12 classes)
3. ✅ Experience enum (10 backgrounds)
4. ✅ Equipment, Consumables, ExperienceBankItem enums
5. ✅ TypeScript interfaces:
   - Attributes (STR, DEX, INT, WIS, CHA: 0-4)
   - LevelEntry (class + level for multiclassing)
   - ResourceCounter (name + number/boolean value)
   - CharacterSheet (complete structure)

### 2.2 Zod Schema Validation
**File:** `src/schemas/character.schema.ts`

**Tasks:**
1. Create Zod schema mirroring TypeScript interfaces
2. Define validation rules:
   - Version: string (semantic versioning format)
   - Name: string (non-empty)
   - Level: array of {class: enum, level: number}
   - Attributes: 5 numbers between 0-4
   - Movement Range: positive number
   - HP: integer
   - MP: positive integer
   - Equipment Slots: array length based on STR attribute
   - Consumable Slots: array length based on DEX attribute
   - Experience Bank: array length based on INT attribute
   - Ability Bonus, Attack Power, Spell Power: integers
   - Range: positive integer
3. Create schema for version history entry
4. Create schema for import/export JSON format
5. Add backward compatibility validation

### 2.3 Version History System
**File:** `src/types/version-history.types.ts`

**Tasks:**
1. Define VersionHistoryEntry interface:
   - timestamp: ISO date string
   - version: string
   - characterData: full character state
   - label: optional string description
2. Design storage format for embedding history in HTML
3. Plan backward compatibility strategy for schema migrations

---

## Phase 3: State Management

### 3.1 Character State Store
**File:** `src/stores/character.store.ts`

**Technology:** Zustand (already in dependencies)

**Tasks:**
1. Create Zustand store for character data
2. Implement state actions:
   - `updateField(field, value)` - update single field
   - `updateAttribute(index, value)` - update attribute with validation
   - `addLevel(class)` - add class level (multiclass support)
   - `removeLevel(index)` - remove class level
   - `addResourceCounter(name, type)` - add custom counter
   - `updateResourceCounter(id, value)` - update counter value
   - `deleteResourceCounter(id)` - remove counter
   - `resetCharacter()` - clear all data
   - `loadCharacter(data)` - import character
3. Add derived state calculations:
   - Calculate Equipment Slots from STR
   - Calculate Consumable Slots from DEX
   - Calculate Experience Bank from INT
   - Calculate total character level
4. Integrate Zod validation on state updates

### 3.2 Version History Store
**File:** `src/stores/version-history.store.ts`

**Tasks:**
1. Create Zustand store for version history
2. Implement actions:
   - `saveVersion(label?)` - create snapshot with timestamp
   - `loadVersion(timestamp)` - restore from history
   - `getVersionList()` - retrieve all versions
   - `deleteVersion(timestamp)` - remove version (optional)
3. Add auto-save triggers (configurable intervals or manual)
4. Limit history size (e.g., keep last 50 versions)

### 3.3 Persistence Layer
**File:** `src/utils/persistence.ts`

**Tasks:**
1. Create functions to serialize state to JSON
2. Create functions to deserialize and validate imported JSON
3. Implement HTML self-modification:
   - Read current character state
   - Encode as base64 or JSON string
   - Inject into HTML file's `<script>` tag or data attribute
   - Trigger browser download of modified HTML
4. Implement initial state loading:
   - Check for embedded data on app load
   - Parse and validate embedded character data
   - Initialize stores with loaded data
5. Create import/export utilities:
   - Export character as JSON file
   - Import character from JSON file with validation

---

## Phase 4: UI Components

### 4.1 Core shadcn/ui Components Setup
**Tasks:**
1. Initialize shadcn/ui if not already done
2. Add required components:
   - Input
   - Select
   - Button
   - Card
   - Label
   - Tooltip
   - Dialog
   - Tabs
   - Separator
   - Form (for validation display)
3. Customize theme with Tailwind for TTRPG aesthetic

### 4.2 Character Info Section
**File:** `src/components/CharacterInfo.tsx`

**Tasks:**
1. Create form inputs for:
   - Character name (text input)
   - Species (select dropdown)
   - Experiences (select dropdown)
2. Add validation with Zod
3. Display validation errors in tooltips
4. Ensure full keyboard navigation (tab order)
5. Style with shadcn/ui components

### 4.3 Level & Class Section
**File:** `src/components/LevelClassSection.tsx`

**Tasks:**
1. Display multiclass levels as list/table
2. Add "+ Add Class" button for multiclassing
3. Each entry shows: Class dropdown + Level number
4. Remove button for each class entry
5. Calculate and display total level
6. Auto-populate class features (display only)
7. Keyboard navigation support

### 4.4 Attributes Section
**File:** `src/components/AttributesSection.tsx`

**Tasks:**
1. Create 5 attribute inputs (0-4 range)
2. Label each attribute clearly
3. Use number inputs with min/max validation
4. Display derived calculations:
   - Equipment Slots (based on STR)
   - Consumable Slots (based on DEX)
   - Experience Bank (based on INT)
5. Add tooltips for attribute descriptions

### 4.5 Combat Stats Section
**File:** `src/components/CombatStatsSection.tsx`

**Tasks:**
1. Create inputs for:
   - HP (integer)
   - MP (positive integer)
   - Movement Range (positive number)
   - Ability Bonus (integer)
   - Attack Power (integer)
   - Spell Power (integer)
   - Range (positive integer)
2. Add validation with appropriate constraints
3. Use consistent styling with other sections

### 4.6 Equipment & Inventory Section
**File:** `src/components/InventorySection.tsx`

**Tasks:**
1. Display Equipment Slots (array, length = STR attribute)
2. Display Consumable Slots (array, length = DEX attribute)
3. Display Experience Bank (array, length = INT attribute)
4. Each slot: dropdown with enum values
5. Auto-adjust array lengths when attributes change
6. Add visual indicators for filled/empty slots

### 4.7 Resource Counters Section
**File:** `src/components/ResourceCounters.tsx`

**Tasks:**
1. Display list of custom resource counters
2. Add "+ New Counter" button
3. Each counter shows:
   - Name (text input)
   - Type toggle (number vs boolean)
   - Value input (number or checkbox)
   - Delete button
4. Keyboard navigation and accessibility

### 4.8 Version History Modal
**File:** `src/components/VersionHistoryModal.tsx`

**Tasks:**
1. Create dialog/modal component
2. Display list of all saved versions:
   - Timestamp (formatted as human-readable)
   - Optional label
   - Preview button
   - Revert button
3. Preview sub-modal:
   - Show character data in read-only view
   - Close with Escape key
4. Revert functionality with confirmation
5. Close modal with Escape key
6. Full keyboard navigation

### 4.9 Main Layout & Navigation
**File:** `src/components/CharacterSheet.tsx`

**Tasks:**
1. Create main layout container
2. Organize sections using tabs or accordion
3. Add header with:
   - Character name display
   - Save button (saves version)
   - Export JSON button
   - Import JSON button
   - Version History button
4. Add footer with version number
5. Ensure responsive design
6. Test full keyboard navigation flow

### 4.10 Form Validation UI
**File:** `src/components/ValidationTooltip.tsx`

**Tasks:**
1. Create reusable validation tooltip component
2. Display Zod validation errors
3. Position tooltips near invalid inputs
4. Style error states (red borders, etc.)
5. Accessible error announcements

---

## Phase 5: Core Features Implementation

### 5.1 Character Data Management
**Files:** Various components + stores

**Tasks:**
1. Wire up all form inputs to Zustand store
2. Implement real-time validation on input changes
3. Test all field updates and derived calculations
4. Add debouncing for text inputs if needed
5. Ensure immutability in state updates

### 5.2 Version History Features
**Files:** `src/components/VersionHistoryModal.tsx` + stores

**Tasks:**
1. Implement manual save version functionality
2. Add auto-save on significant changes (optional)
3. Test version restoration
4. Verify datetime formatting
5. Test version preview without affecting current state

### 5.3 Import/Export System
**Files:** `src/utils/import-export.ts` + UI components

**Tasks:**
1. Implement JSON export:
   - Serialize current character state
   - Include version number
   - Trigger browser download
2. Implement JSON import:
   - File picker dialog
   - Parse and validate JSON
   - Handle schema version differences
   - Merge/replace current data
3. Add user confirmation before importing
4. Display import success/error messages

### 5.4 Self-Modifying HTML
**Files:** `src/utils/html-modifier.ts`

**Tasks:**
1. Implement "Save Character" functionality:
   - Read current HTML file content (if possible via Service Worker)
   - OR regenerate HTML structure programmatically
   - Embed character state as JSON in `<script type="application/json">`
   - Embed version history in same or separate script tag
   - Trigger download of modified HTML file
2. Implement initial state hydration:
   - On app mount, check for embedded data
   - Parse embedded JSON
   - Validate with Zod
   - Initialize stores
3. Handle edge cases:
   - Empty/new character sheet
   - Corrupted embedded data
   - Version mismatches

### 5.5 Backward Compatibility
**Files:** `src/utils/schema-migration.ts`

**Tasks:**
1. Define schema version numbering
2. Create migration functions for each version change:
   - v1.0.0 → v1.1.0
   - v1.1.0 → v2.0.0
   - etc.
3. Apply migrations when loading old character data
4. Test with mock data from various versions
5. Document breaking changes and migration paths

---

## Phase 6: Accessibility & Polish

### 6.1 Keyboard Navigation
**Tasks:**
1. Test complete tab order through all sections
2. Implement arrow key navigation where appropriate (lists, tabs)
3. Ensure all interactive elements are keyboard accessible
4. Add visible focus indicators
5. Test with keyboard-only workflow

### 6.2 ARIA Labels & Screen Reader Support
**Tasks:**
1. Add ARIA labels to all form inputs
2. Add ARIA descriptions for complex components
3. Ensure modals trap focus
4. Add ARIA live regions for dynamic updates

### 6.3 Visual Design & UX
**Tasks:**
1. Create cohesive TTRPG-themed design
2. Ensure consistent spacing and alignment
3. Add visual feedback for user actions
4. Implement loading states where needed
5. Add tooltips for guidance
6. Responsive design for different screen sizes
7. Print stylesheet (optional)

### 6.4 Error Handling & User Feedback
**Tasks:**
1. Add error boundaries for React components
2. Display user-friendly error messages
3. Add success notifications (toast/snackbar)
4. Handle file operation errors gracefully
5. Add confirmation dialogs for destructive actions

---

## Phase 7: Testing

### 7.1 Unit Tests (Vitest)
**Tasks:**
1. Test Zod schemas:
   - Valid data passes
   - Invalid data fails with correct errors
2. Test utility functions:
   - JSON serialization/deserialization
   - Schema migrations
   - Derived calculations
3. Test Zustand store actions:
   - State updates correctly
   - Derived state recalculates
4. Target: >80% code coverage for utilities and stores

### 7.2 Component Tests
**Tasks:**
1. Test form inputs:
   - Value updates on change
   - Validation errors display
2. Test resource counter CRUD
3. Test version history operations
4. Test import/export flows
5. Use React Testing Library

### 7.3 Integration Tests
**Tasks:**
1. Test complete user workflows:
   - Create new character
   - Fill all fields
   - Save version
   - Modify character
   - Revert to previous version
   - Export to JSON
   - Import from JSON
2. Test edge cases:
   - Empty character
   - Maximum values
   - Minimum values
   - Invalid imports

### 7.4 Browser Testing
**Tasks:**
1. Test in Chrome/Edge
2. Test in Firefox
3. Test in Safari (if available)
4. Verify single-file HTML works offline
5. Test HTML self-modification downloads

---

## Phase 8: Build & Deployment

### 8.1 Production Build Configuration
**Tasks:**
1. Optimize Vite build for smallest bundle size
2. Minify CSS and JavaScript
3. Inline all assets (images, fonts if any)
4. Test production build
5. Verify single HTML file output
6. Check file size (aim for <2MB)

### 8.2 Documentation
**Files:** `README.md`, `USAGE.md`

**Tasks:**
1. Write project README:
   - Project description
   - Features list
   - How to use
   - How to build from source
2. Write user guide:
   - Character creation walkthrough
   - Import/export instructions
   - Version history usage
   - Keyboard shortcuts
3. Add developer documentation:
   - Architecture overview
   - State management explanation
   - Adding new features guide
4. Document schema versions and migrations

### 8.3 Release Preparation
**Tasks:**
1. Set initial version to v1.0.0
2. Create distribution folder
3. Generate production build
4. Test final HTML file thoroughly
5. Create release notes
6. Package example character JSON files

---

## Phase 9: Future Enhancements (Optional)

### 9.1 Advanced Features
- [ ] Dice roller integration
- [ ] Character portrait upload (base64 encoded)
- [ ] Printable character sheet CSS
- [ ] Dark/light theme toggle
- [ ] Spell/ability descriptions database
- [ ] Auto-calculation of derived stats from rules
- [ ] Character comparison tool
- [ ] Party management (multiple characters)

### 9.2 Technical Improvements
- [ ] PWA support for offline use
- [ ] IndexedDB for larger storage
- [ ] Undo/redo functionality
- [ ] Real-time collaboration (if hosted)
- [ ] Encryption for character data
- [ ] Cloud sync option (optional)

---

## Implementation Order Priority

### High Priority (MVP)
1. ✅ Phase 1.1 - Complete dependencies setup
2. Phase 1.2 - Single-file build configuration
3. Phase 2 - Complete data architecture
4. Phase 3 - State management
5. Phase 4 - Core UI components
6. Phase 5 - Core features
7. Phase 8.1 - Production build

### Medium Priority (Polish)
8. Phase 6 - Accessibility & polish
9. Phase 7 - Testing
10. Phase 8.2-8.3 - Documentation & release

### Low Priority (Future)
11. Phase 9 - Future enhancements

---

## Success Criteria

- ✅ Single `index.html` file contains entire application
- ✅ All character sheet fields are editable and save correctly
- ✅ Version history saves and restores character state
- ✅ Export to JSON works
- ✅ Import from JSON works with validation
- ✅ Full keyboard navigation support
- ✅ Zod validation with tooltip errors
- ✅ Offline functionality (no external dependencies)
- ✅ Clean, scalable UI with shadcn/ui
- ✅ Backward compatible with older schema versions

---

## Technical Challenges & Solutions

### Challenge 1: Single-File HTML with React
**Solution:** Use Vite plugin or custom build script to inline all JS/CSS into HTML. Bundle all dependencies with Rollup.

### Challenge 2: HTML Self-Modification
**Solution:** Instead of modifying the actual file, generate a new HTML file with embedded data and trigger download. On load, parse embedded data from script tags.

### Challenge 3: Version History Storage
**Solution:** Embed version history as JSON in script tag with `type="application/json"`. Limit history size to prevent file bloat.

### Challenge 4: Backward Compatibility
**Solution:** Implement schema versioning with migration functions. Always store version number with character data. Apply migrations sequentially when loading old data.

### Challenge 5: Dynamic Array Lengths
**Solution:** Use React state to render dynamic number of slots based on attribute values. When attribute changes, add/remove slots and preserve existing data where possible.

---

## Timeline Estimate

- **Phase 1-2:** 1-2 days (Setup + Architecture)
- **Phase 3:** 2-3 days (State Management)
- **Phase 4:** 4-5 days (UI Components)
- **Phase 5:** 3-4 days (Core Features)
- **Phase 6:** 2-3 days (Accessibility)
- **Phase 7:** 3-4 days (Testing)
- **Phase 8:** 1-2 days (Build & Docs)

**Total Estimated Time:** ~16-23 days for full MVP

---

## Current Status

- [x] Project initialized with Vite + React + TypeScript
- [x] Tailwind CSS configured
- [x] shadcn/ui components available
- [x] Zustand installed
- [ ] Zod installed
- [ ] Vitest configured
- [ ] Single-file build configured
- [ ] Type definitions created
- [ ] State management implemented
- [ ] UI components built
- [ ] Core features working
- [ ] Tests written
- [ ] Production build ready

**Next Steps:** Install Zod, configure single-file build, and begin Phase 2.
