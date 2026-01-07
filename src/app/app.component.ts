import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackRepository } from './services/feedback.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private feedbackRepository = inject(FeedbackRepository);

  title = 'Talent Hub';

  async onDownload() {
    try {
      await this.feedbackRepository.downloadAllFeedbacks();
    } catch (error) {
      alert('Error al descargar los datos');
    }
  }

  onUpload() {
    // TODO: Implementar carga de datos
    console.log('Cargar datos');
  }
}
