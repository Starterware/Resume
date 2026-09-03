import { Component, input } from '@angular/core';
import { SkillGroup } from '../../../core/models/cv.model';

@Component({
  selector: 'cv-skill-grid',
  template: `
    <dl class="skills">
      @for (group of groups(); track group.category) {
        <div class="skills__group">
          <dt class="skills__category">{{ group.category }}</dt>
          <dd class="skills__items">{{ group.items.join(' · ') }}</dd>
        </div>
      }
    </dl>
  `,
  styles: `
    .skills {
      margin: 0;
      display: grid;
      gap: 0.6rem;
    }

    .skills__group {
      display: grid;
      grid-template-columns: minmax(6rem, 9rem) 1fr;
      gap: 1rem;
      align-items: baseline;
    }

    .skills__category {
      font-weight: 600;
      color: var(--colour-muted);
    }

    .skills__items {
      margin: 0;
    }

    @media (max-width: 32rem) {
      .skills__group {
        grid-template-columns: 1fr;
        gap: 0.15rem;
      }
    }
  `,
})
export class SkillGrid {
  readonly groups = input.required<SkillGroup[]>();
}
