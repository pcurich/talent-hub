import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-entity',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-entity.component.html',
  styleUrl: './search-entity.component.scss'
})
export class SearchEntityComponent {
  searchTerm = '';
  search = output<string>();

  onSearchChange() {
    this.search.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.search.emit('');
  }
}
