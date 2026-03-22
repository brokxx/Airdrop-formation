# Design System Strategy: The Luminescent Scholar

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

In the chaotic, often high-friction world of crypto airdrops, this system acts as a sophisticated, calm guide. We are moving away from the "neon-on-black" hacker aesthetic toward a high-end educational editorial style. The layout rejects the rigid, boxy constraints of standard dashboards in favor of **Intentional Asymmetry**. By using overlapping elements, staggered card layouts, and dramatic typographic scales, we create a sense of forward momentum and "tech-forward" prestige. 

The goal is to make the user feel like they are interacting with a premium intelligence terminal, not just a website.

## 2. Colors: Tonal Depth over Borders
Our palette leverages Deep Purples (`primary_container`) and Electric Blues (`secondary`) to create a sense of "electric trust." 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. 
Boundaries must be created through background color shifts. For example, a "Play" card using `surface_container_highest` should sit directly on a `surface` background. The contrast between these tokens provides all the definition required.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered, frosted panels. 
- **Base Layer:** `surface` (#131313) or `surface_dim`.
- **Content Sections:** Use `surface_container_low` for large content areas.
- **Interactive Elements:** Use `surface_container_high` or `highest` for cards and modals to create a "lifted" feel.

### The "Glass & Gradient" Rule
To achieve a signature "Crypto-Tech" feel, utilize Glassmorphism for floating navigation bars or "Play" status overlays. Use `surface` at 60% opacity with a `20px` backdrop blur. 
**Signature Texture:** Apply a subtle linear gradient to Hero CTAs transitioning from `primary` (#cdbdff) to `primary_container` (#5d21df) at a 135-degree angle. This adds "visual soul" that flat hex codes cannot replicate.

## 3. Typography: The Editorial Edge
The contrast between the geometric rigidity of **Space Grotesk** and the humanistic clarity of **Manrope** creates an authoritative yet accessible voice.

*   **Display & Headlines (Space Grotesk):** Use `display-lg` (3.5rem) for hero sections with tight letter-spacing (-0.02em). This "loud" typography mimics high-end tech journals.
*   **Body & Labels (Manrope):** Use `body-lg` (1rem) for educational modules. The increased x-height of Manrope ensures readability during long training sessions.
*   **The Power of Scale:** Don't be afraid of white space. A `headline-lg` title should be given significant breathing room (using `spacing-12` or `16`) to command attention.

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines; we use **Tonal Stacking**.

*   **Ambient Shadows:** If an element must "float" (like a Day/Night toggle or a sticky 'Join Play' button), use a shadow with a 40px blur at 6% opacity, tinted with `on_surface`. It should feel like an ambient glow, not a drop shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast light mode), use the `outline_variant` token at **15% opacity**. Never use 100% opaque outlines.
*   **Layering Principle:** 
    1. Page Background: `surface`
    2. Educational Track: `surface_container_low`
    3. Individual Play Card: `surface_container_highest`
    4. Floating Progress Badge: Glassmorphism (`surface_bright` @ 50% + blur)

## 5. Components

### Interactive 'Play' Cards
*   **Structure:** No borders. Use `surface_container_highest` with a `xl` (1.5rem) border radius.
*   **Interaction:** On hover, shift the background to `surface_bright`. 
*   **Educational Content:** Use `spacing-6` internal padding. Titles in `title-lg`, subtext in `body-md` using `on_surface_variant` for visual hierarchy.

### Step-by-Step Progress Indicators
*   **Visuals:** Use a "connected-node" layout. Active steps use a `secondary` (Electric Blue) glow. 
*   **Inactivity:** Completed steps transition to `primary_fixed_dim` to show progress without distracting from the current task.

### Primary Buttons
*   **Style:** `xl` (1.5rem) roundedness. 
*   **Color:** `primary` background with `on_primary` text.
*   **Animation:** On hover, a subtle `0.5rem` expansion of an outer "aura" (a shadow colored with `surface_tint`).

### Input Fields
*   **Style:** Use `surface_container_lowest` for the input track. 
*   **Focus State:** Do not use a heavy border. Instead, use a subtle `2px` glow of `secondary` on the bottom edge only, or a slight shift in the entire background tone to `surface_container_high`.

### The Day/Night Toggle
*   **Design:** A "pill" shape (`full` roundedness) using `surface_container_high`. The handle should be a perfect circle using `tertiary_fixed`. When toggled, use a soft `300ms` color cross-fade across the entire surface hierarchy.

## 6. Do's and Don'ts

### Do
*   **Do** use intentional asymmetry. Align a headline to the left and the "Play" card to the right with a staggered vertical offset.
*   **Do** use scroll-triggered reveals. As a user scrolls through a "Play," have text elements fade in and slide up `20px` using a `cubic-bezier(0.16, 1, 0.3, 1)` easing.
*   **Do** use `on_surface_variant` for "meta" information (e.g., "5 mins read") to keep the primary `on_surface` text the focal point.

### Don't
*   **Don't** use 1px dividers between list items. Use `spacing-4` of vertical gap or a slight color shift.
*   **Don't** use pure black (#000000). Always use the `surface` token (#131313) to maintain depth and prevent "OLED black smear."
*   **Don't** use "Standard" blue. Only use the `secondary` electric blue for accents, never for large blocks of background color.