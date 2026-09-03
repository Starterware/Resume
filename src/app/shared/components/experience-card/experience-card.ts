import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExperienceEntry, Lang, UiStrings } from '../../../core/models/cv.model';
import { LogoChip } from '../logo/logo';
import { MonthYearPipe } from '../../pipes/month-year-pipe';

@Component({
  selector: 'cv-experience-card',
  imports: [LogoChip, MonthYearPipe, RouterLink],
  templateUrl: './experience-card.html',
  styleUrl: './experience-card.scss',
})
export class ExperienceCard {
  readonly entry = input.required<ExperienceEntry>();
  readonly lang = input.required<Lang>();
  readonly ui = input.required<UiStrings>();
}
