# Design System "Ultrathink"

## Core Philosophy
The "Ultrathink" design system focuses on creating a **modern, professional, and immersive** user experience. It blends glassmorphism, soft gradients, and high-quality typography to deliver an interface that feels both premium and accessible.

### Key Principles
1.  **Glassmorphism & Depth:** Heavy usage of `backdrop-blur-xl`, semi-transparent backgrounds (`bg-white/10` or `bg-black/5`), and subtle borders to create depth without clutter.
2.  **Soft Gradients:** Backgrounds and cards utilize soft, directional gradients (e.g., `bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10`) to provide character and visual interest.
3.  **Watermark Iconography:** Cards often feature a large, rotated, low-opacity icon in the background (`absolute -right-10 -top-10 opacity-[0.06]`) to reinforce context visually.
4.  **Fluid Typography:** Large, bold headings (`text-4xl`, `text-5xl`) for data, paired with crisp uppercase tracking (`tracking-widest`) for labels.
5.  **Micro-Interactions:** Smooth transitions, hover effects that lift cards (`hover:-translate-y-1`), and subtle glows (`shadow-lg`).

---

## Component Guidelines

### 1. Cards & Widgets
Cards are the building blocks of the dashboard and tool interfaces.

*   **Structure:**
    ```tsx
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ... shadow-sm">
      {/* Background Watermark */}
      <div className="absolute -right-10 -top-10 ...">
         <Icon className="w-32 h-32 opacity-10" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
         ...
      </div>
    </div>
    ```
*   **Border Radius:** Use `rounded-3xl` (or `rounded-[2rem]` for larger containers) to create a soft, friendly silhouette.
*   **Themes:**
    *   **Rose (Split Count):** `from-rose-500/10` ... `text-rose-500`
    *   **Amber (Currency):** `from-amber-500/10` ... `text-amber-500`
    *   **Emerald (Units):** `from-emerald-500/10` ... `text-emerald-500`
    *   **Indigo (Translate):** `from-indigo-500/10` ... `text-indigo-500`
    *   **Slate/Blue (Generic):** `from-slate-700` ... `to-indigo-900`

### 2. Modals & Dialogs
Modals are treated as mini-applications rather than simple popups.

*   **Container:** Fixed, large size (`max-w-5xl h-[85vh]`) with `backdrop-blur-2xl` backgrounds.
*   **Header:** Persistent, unified header bar with navigation controls (Back button).
*   **Content:** Scrollable area (`ScrollArea`) that transitions smoothly (`AnimatePresence`) between views.
*   **Close Button:** Custom "Glassy Red" button in the top-right corner.
    ```tsx
    <DialogClose className="... bg-red-500/10 backdrop-blur-xl border-red-500/20 text-red-600 ...">
       <X />
    </DialogClose>
    ```

### 3. Inputs & Forms
Inputs are designed to be tactile and prominent.

*   **Large Inputs:** For main values (currency, calculator), use massive text (`text-5xl`) on transparent backgrounds (`bg-transparent`) to blend seamlessly with the card.
*   **Floating Actions:** Primary actions (Translate, Calculate) often float in the bottom-right corner (`absolute bottom-4 right-4`) or use large rounded buttons (`rounded-2xl`).
*   **Selects:** Custom styled Select triggers that match the card's theme (e.g., `bg-indigo-50` for Translator).

### 4. Typography
*   **Data/Numbers:** `font-bold tracking-tighter tabular-nums` (e.g., clocks, currency output).
*   **Labels:** `text-xs font-bold uppercase tracking-widest text-muted-foreground` (e.g., "FROM", "TO", "DESTINATION").
*   **Body:** `text-base` or `text-lg` with `leading-relaxed` for readability.

---

## Color Palettes (Tailwind)

| Theme | Gradient Start | Gradient Via | Gradient End | Accent Text | Border |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rose** | `rose-500/10` | `pink-500/5` | `red-500/10` | `rose-500` | `rose-500/20` |
| **Amber** | `amber-500/10` | `orange-500/5` | `yellow-500/10` | `amber-500` | `amber-500/20` |
| **Emerald**| `emerald-500/10`| `teal-500/5` | `green-500/10` | `emerald-500` | `emerald-500/20` |
| **Indigo** | `indigo-500/10` | `violet-500/5` | `purple-500/10`| `indigo-500` | `indigo-500/20` |
| **Sky** | `sky-500/10` | `blue-500/5` | `cyan-500/10` | `sky-500` | `sky-500/20` |

---

## Implementation Checklist
When adding a new feature or tool:
- [ ] Does it use a `rounded-3xl` container?
- [ ] Is there a subtle background gradient and watermark icon?
- [ ] Are primary actions clear and accessible (floating or large buttons)?
- [ ] Is the typography consistent (uppercase labels, bold data)?
- [ ] Does it support Dark Mode? (Ensure `dark:` variants are handled, usually by using opacity-based colors like `bg-primary/10`).
