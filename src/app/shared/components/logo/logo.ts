import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { Logo } from '../../../core/models/cv.model';

/**
 * A logo in a fixed white chip.
 *
 * The source logos disagree with each other — some are square, one is a wide
 * wordmark, and their backgrounds are variously navy, blue, white and
 * transparent. Normalising them onto one white tile is what stops the column
 * looking like a ransom note, and it keeps every logo legible in dark mode
 * without needing per-brand overrides.
 */
@Component({
  selector: 'cv-logo',
  imports: [NgOptimizedImage],
  template: `
    <span class="chip">
      <img
        [ngSrc]="logo().src"
        [width]="logo().width"
        [height]="logo().height"
        [alt]="logo().alt"
      />
    </span>
  `,
  styles: `
    :host {
      display: block;
    }

    /* No padding: the logo fills the tile, so the border sits on the edge of
       the artwork instead of framing a box larger than it. Every source logo is
       square, so object-fit fills the tile exactly rather than letterboxing. */
    .chip {
      display: block;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      border-radius: 8px;
      background: #fff;
      border: 1px solid var(--colour-rule);
      flex-shrink: 0;
    }

    /* The radius goes on the image itself rather than on the chip with an
       overflow clip: clipping a replaced element to an ancestor's rounded
       corners is not reliable across browsers. 7px is the chip's 8px less its
       1px border, so the two curves stay concentric. */
    img {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      object-fit: contain;
      border-radius: 7px;
    }
  `,
})
export class LogoChip {
  readonly logo = input.required<Logo>();
}
