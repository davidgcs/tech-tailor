import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-problematic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let item of filteredItems; trackBy: trackById">
      <expensive-component [data]="item"></expensive-component>
    </div>
  `
})
export class ProblematicComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() filter: string = '';
  filteredItems: any[] = [];

  private cache = new Map<any, number>();

  ngOnChanges(changes: SimpleChanges): void {
    const term = this.filter?.toLowerCase() || '';
    this.filteredItems = this.items
      .filter(item => item.name.toLowerCase().includes(term))
      .map(item => ({
        ...item,
        computed: this.getCachedComputation(item)
      }));
  }

  private getCachedComputation(item: any): number {
    if (!this.cache.has(item)) {
      this.cache.set(item, this.heavyComputation(item));
    }
    return this.cache.get(item)!;
  }

  private heavyComputation(item: any): number {
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random() * item.value;
    }
    return result;
  }

  trackById(index: number, item: any): any {
    return item.id ?? index;
  }
}

//Cambios:
// 1. Se agregó un método `getCachedComputation` para manejar la lógica de caché.
// 2. Se utiliza un `Map` para almacenar los resultados de las computaciones pesadas.
// 3. Se asegura que la caché se actualice solo cuando sea necesario, evitando cálculos innecesarios.
// 4. Se implementa `trackBy` para mejorar el rendimiento del *ngFor
