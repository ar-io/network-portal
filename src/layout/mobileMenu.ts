/**
 * Left padding that clears the floating mobile menu button.
 *
 * The button is `fixed left-4` and 40px square, so it occupies x 16-56 and
 * floats over whatever is beneath it. Every page's breadcrumb row started at
 * `pl-6` — x=24, under the button — so the first crumb rendered beneath the
 * hamburger and the two collided. Measured, not guessed: 64px clears the
 * button's 56px edge with a gap.
 *
 * Shared so the five headers cannot drift from each other, or from the
 * button's own position, one patch at a time.
 */
export const MOBILE_MENU_CLEARANCE = 'pl-16 lg:pl-6';
