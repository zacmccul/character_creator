# Character Creator

A fully-contained, configuration-driven character sheet creator for tabletop RPG systems, built as a single HTML file.

## 🚀 Quick Start: Edit Config Files on GitHub (No Coding Required!)

### Step 1: Create a GitHub Account
1. Go to [github.com](https://github.com)
2. Click the green "Sign up" button in the top-right corner
3. Enter your email address and follow the prompts to create your account
4. Verify your email address when GitHub sends you a confirmation email

### Step 2: Navigate to This Repository
1. Once logged in, go to: `https://github.com/zacmccul/character_creator`
2. You should see a list of files and folders

### Step 3: Edit a Config File in Your Browser
1. Click on the `public` folder
2. Click on the `config` folder
3. Choose a configuration file to edit (for example, `character-info.json`)
4. Click the **pencil icon** (✏️) in the top-right corner that says "Edit this file"
5. Make your changes directly in the browser editor
   - For example, change the default character name or add new fields
6. Scroll down to the bottom of the page

### Step 4: Save Your Changes (Create a Commit)
1. In the "Commit changes" box at the bottom:
   - Add a short description of what you changed (e.g., "Changed default character name")
   - Optionally add more details in the larger text box
2. Select **"Commit directly to the main branch"** (or create a new branch if you prefer)
3. Click the green **"Commit changes"** button

### Step 5: Automatic Deployment
1. Your changes will automatically trigger a deployment!
2. Click the "Actions" tab at the top of the repository to watch the deployment progress
3. After a few minutes, your changes will be live at: `https://zacmccul.github.io/character_creator/`
4. Refresh the page to see your updated character sheet

### 🎯 Which Config Files Can You Edit?

All configuration files are in `public/config/`:

- **`character-info.json`** - Character name, species, experiences settings
- **`attributes.json`** - Define the 5 core attributes (STR, DEX, etc.)
- **`combat-stats.json`** - HP, MP, attack power, range settings
- **`level-class.json`** - Class options and multiclassing rules
- **`inventory.json`** - Equipment slots, consumable slots configuration
- **`enums.json`** - All dropdown options (species, classes, items, etc.)
- **`layout.json`** - Visual layout and section arrangement

### 📋 Example: Adding a New Species

1. Open `public/config/enums.json`
2. Find the `"species"` section
3. Add your new species to the list:
```json
"species": [
  "Human",
  "Elf",
  "Dwarf",
  "Orc",
  "Your New Species"  ← Add this line (don't forget the comma!)
]
```
4. Commit your changes following Steps 4-5 above

---

## 🛠️ For Developers

### Features
- **Single File Distribution**: Everything packaged in one `index.html`
- **Configuration-Driven**: No code changes needed to customize character sheets
- **Version History**: Built-in versioning with revert capability
- **Import/Export**: JSON-based character data for portability
- **Offline-First**: Works completely offline once loaded
- **Keyboard Accessible**: Full tab/arrow key navigation

### Tech Stack
- **React 18** + **TypeScript** for the UI
- **Vite** for building and bundling
- **shadcn/ui** + **Tailwind CSS** for styling
- **Zod** for schema validation
- **Zustand** for state management
- **vitest** for testing

### Local Development

#### Prerequisites
- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

#### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build production bundle
pnpm build
```

### Project Structure
```
public/config/          # JSON configuration files
public/schemas/         # JSON schemas for validation
src/
  components/           # React components
  schemas/             # Zod schemas
  stores/              # Zustand state stores
  types/               # TypeScript type definitions
  utils/               # Utility functions
examples/              # Example configurations (D&D, one-column layout)
docs/                  # Detailed documentation
```

### Configuration System

The character sheet is fully driven by JSON configuration files. See `docs/CONFIGURATION_SYSTEM.md` for detailed documentation.

Key configuration concepts:
- **Enums**: Define dropdown options for species, classes, items, etc.
- **Attributes**: Configure the core attributes (name, min/max values, calculations)
- **Layout**: Control section ordering and visual arrangement
- **Validation**: Schemas ensure configuration integrity

### Building Examples

Generate standalone HTML files from example configurations:

```bash
pnpm build:examples
```

This creates `index.html` files in each example directory (e.g., `examples/dnd/index.html`).

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Deployment

The project automatically deploys to GitHub Pages when changes are pushed to the main branch. The deployment includes:
- Main character sheet at `/`
- Example configurations at `/examples/dnd/` and `/examples/one-column/`

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Documentation

- **[Configuration System](docs/CONFIGURATION_SYSTEM.md)** - Complete guide to configuration files
- **[Layout System](docs/LAYOUT_SYSTEM.md)** - How to customize the visual layout
- **[Attribute Configuration](docs/ATTRIBUTE_CONFIGURATION.md)** - Deep dive on attribute configuration
- **[Quick Start](QUICK_START.md)** - Rapid setup guide for developers

### License

This project is open source and available under the MIT License.

### Support

For issues, questions, or contributions, please use the GitHub Issues tab.
