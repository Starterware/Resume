import { Component, input } from '@angular/core';

/** A titled block of the CV, optionally marked with an icon. */
@Component({
  selector: 'cv-section',
  template: `
    <section class="section">
      <h2 class="section__title">
        @if (icon(); as src) {
          <span class="section__icon" [style.--icon]="'url(' + src + ')'" aria-hidden="true"></span>
        }
        {{ title() }}
      </h2>
      <div class="section__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .section {
      margin-block-end: 2.5rem;
    }

    .section__title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--colour-accent);
      border-block-end: 1px solid var(--colour-rule);
      padding-block-end: 0.4rem;
    }

    /* The icons are flat grey rasters, so they are used as a mask over
       currentColor and inherit the heading's accent rather than staying grey. */
    .section__icon {
      inline-size: 1rem;
      block-size: 1rem;
      flex-shrink: 0;
      background-color: currentColor;
      mask: var(--icon) center / contain no-repeat;
      -webkit-mask: var(--icon) center / contain no-repeat;
    }
  `,
})
export class Section {
  readonly title = input.required<string>();
  /** Path to a monochrome image used as a mask, e.g. `images/experience.png`. */
  readonly icon = input<string>();
}
