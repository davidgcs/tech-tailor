# Prueba Técnica - Desarrollador Frontend Angular (Tailor UI)

## Información General

**Duración estimada:** 3-4 horas  
**Modalidad:** Para realizar en casa  
**Entrega:** Repositorio Git con el código y documentación

## Estructura de la Prueba

**Tiempo estimado:** 4-6 horas  
**Puntuación total:** 105 puntos  
**Puntuación mínima para aprobar:** 75 puntos  

### Distribución de Puntos:
1. **Análisis de Código** (15 puntos)
2. **Implementación Práctica** (65 puntos)
   - Smart Navigation Component (25 puntos)
   - NgRx Integration (20 puntos)
   - Animaciones y Performance (20 puntos)
3. **Arquitectura y Optimización** (20 puntos)
4. **Preguntas Conceptuales** (25 puntos)
   - Angular (8 puntos)
   - RxJS y Observables (9 puntos)
   - NgRx (4 puntos)
   - Performance (4 puntos)  

## Contexto del Proyecto

Tailor UI es una aplicación Angular avanzada que utiliza tecnologías como GSAP para animaciones, NgRx para gestión de estado, y WebRTC para funcionalidades de voz. La aplicación incluye componentes complejos de UI, internacionalización, y optimizaciones de rendimiento.

## Objetivos de la Prueba

Evaluar las competencias del candidato en:
- Angular (versión 18+)
- TypeScript avanzado
- Gestión de estado con NgRx
- Animaciones y rendimiento
- Arquitectura de componentes
- Buenas prácticas de desarrollo

---

## PARTE 1: Análisis de Código (30 minutos)

### Ejercicio 1.1: Revisión de Componente

Analiza el siguiente fragmento de código y identifica:

```typescript
@Component({
  selector: 'app-voice-control',
  template: `
    <div class="voice-container" (click)="toggleRecording()">
      <canvas #voiceCanvas></canvas>
      <button [disabled]="isProcessing">{{buttonText}}</button>
    </div>
  `
})
export class VoiceControlComponent implements OnInit {
  @ViewChild('voiceCanvas') canvas: ElementRef;
  isRecording = false;
  isProcessing = false;
  buttonText = 'Iniciar';
  
  constructor(private voiceService: VoiceService) {}
  
  ngOnInit() {
    this.voiceService.status$.subscribe(status => {
      this.isProcessing = status === 'processing';
      this.buttonText = this.isRecording ? 'Detener' : 'Iniciar';
    });
  }
  
  toggleRecording() {
    if (this.isRecording) {
      this.voiceService.stopRecording();
    } else {
      this.voiceService.startRecording();
    }
    this.isRecording = !this.isRecording;
  }
}
```

**Preguntas:**
1. ¿Qué problemas de rendimiento y memory leaks identificas?
2. ¿Qué mejoras de TypeScript aplicarías?
3. ¿Cómo mejorarías la gestión de estado?
4. ¿Qué consideraciones de accesibilidad faltan?

---

## PARTE 2: Implementación Práctica (2.5 horas)

### Ejercicio 2.1: Componente de Navegación Inteligente (45 minutos)

Crea un componente `SmartNavigationComponent` que:

**Requisitos funcionales:**
- Muestre una lista de opciones de navegación dinámicas
- Permita búsqueda/filtrado en tiempo real
- Mantenga historial de navegación reciente
- Soporte para atajos de teclado (Ctrl+K para abrir)

**Requisitos técnicos:**
- Usar Angular Signals para el estado reactivo
- Implementar debounce en la búsqueda (300ms)
- Usar OnPush change detection strategy
- Incluir tests unitarios básicos

**Estructura esperada:**
```
smart-navigation/
├── smart-navigation.component.ts
├── smart-navigation.component.html
├── smart-navigation.component.scss
├── smart-navigation.component.spec.ts
├── smart-navigation.service.ts
└── navigation.types.ts
```

### Ejercicio 2.2: Integración con NgRx (45 minutos)

Implementa la gestión de estado para el componente anterior:

**Crear:**
- Actions para cargar, filtrar y seleccionar opciones de navegación
- Reducer que maneje el estado de navegación
- Effects para simular carga asíncrona de datos
- Selectors optimizados con memoización

**Estado esperado:**
```typescript
interface NavigationState {
  items: NavigationItem[];
  filteredItems: NavigationItem[];
  searchTerm: string;
  recentItems: NavigationItem[];
  loading: boolean;
  error: string | null;
}
```

### Ejercicio 2.3: Animaciones y Rendimiento (45 minutos)

Añade animaciones al componente de navegación:

**Implementar:**
- Animación de entrada/salida del modal (fade + scale)
- Animación de lista con stagger effect para los items
- Lazy loading virtual scroll para listas grandes (>100 items)
- Optimización: cancelar animaciones cuando el componente no es visible

**Usar:**
- Angular Animations API o GSAP (preferible)
- Intersection Observer para optimizaciones
- `trackBy` functions para ngFor

### Ejercicio 2.4: Internacionalización (30 minutos)

Implementa soporte i18n:

**Crear:**
- Archivos de traducción (es.json, en.json)
- Pipe personalizado para traducciones dinámicas
- Servicio para cambio de idioma en runtime

**Traducciones requeridas:**
- Placeholder de búsqueda
- Mensajes de estado (cargando, sin resultados, error)
- Atajos de teclado

---

## PARTE 3: Arquitectura y Optimización (45 minutos)

### Ejercicio 3.1: Refactoring de Performance

Optimiza este componente problemático:

```typescript
@Component({
  template: `
    <div *ngFor="let item of getFilteredItems()">
      <expensive-component [data]="processData(item)"></expensive-component>
    </div>
  `
})
export class ProblematicComponent {
  @Input() items: any[];
  @Input() filter: string;
  
  getFilteredItems() {
    return this.items.filter(item => 
      item.name.toLowerCase().includes(this.filter.toLowerCase())
    );
  }
  
  processData(item: any) {
    // Operación costosa
    return {
      ...item,
      computed: this.heavyComputation(item)
    };
  }
  
  heavyComputation(item: any) {
    // Simulación de cálculo pesado
    let result = 0;
    for(let i = 0; i < 1000000; i++) {
      result += Math.random() * item.value;
    }
    return result;
  }
}
```

**Tareas:**
1. Identifica todos los problemas de rendimiento
2. Refactoriza usando mejores prácticas
3. Implementa memoización donde sea necesario
4. Añade change detection strategy apropiada

### Ejercicio 3.2: Diseño de Arquitectura

**Escenario:** Necesitas añadir un sistema de notificaciones en tiempo real que:
- Reciba notificaciones via WebSocket
- Muestre toast notifications
- Mantenga historial persistente
- Permita configuración de usuario

**Entregables:**
1. Diagrama de arquitectura (puede ser texto/ASCII)
2. Definición de interfaces TypeScript
3. Estructura de carpetas propuesta
4. Plan de implementación por fases

---

## PARTE 4: Preguntas Conceptuales (30 minutos)

### 4.1 Angular Avanzado
1. Explica la diferencia entre `OnPush` y `Default` change detection y cuándo usar cada uno
2. ¿Cómo implementarías lazy loading de módulos con pre-loading strategy?
3. ¿Cuál es la diferencia entre `ViewChild` y `ContentChild`?

### 4.2 RxJS y Observables
1. **Operadores de Transformación**: Explica las diferencias entre `switchMap`, `mergeMap`, `concatMap` y `exhaustMap`. Proporciona un ejemplo de cuándo usarías cada uno.

2. **Manejo de Errores**: ¿Cómo manejarías errores en una cadena de observables sin romper el stream? Muestra un ejemplo con `catchError`.

3. **Memory Leaks**: Identifica y explica cómo prevenir memory leaks en este código:
```typescript
@Component({...})
export class MyComponent implements OnInit {
  data$ = new BehaviorSubject<any[]>([]);
  
  ngOnInit() {
    this.service.getData().subscribe(data => {
      this.data$.next(data);
    });
    
    interval(1000).subscribe(() => {
      console.log('Timer tick');
    });
  }
}
```

4. **Combinación de Observables**: Implementa una función que combine dos observables donde:
   - El primero emite cada 2 segundos
   - El segundo emite cuando el usuario hace click
   - Solo quieres el valor más reciente de ambos cuando cualquiera emite

### 4.3 NgRx y Estado
1. ¿Cuándo recomendarías usar NgRx vs servicios simples con BehaviorSubject?
2. Explica el patrón de Entity Adapter y sus beneficios
3. ¿Cómo manejarías el estado de formularios complejos con NgRx?

### 4.4 Performance y Optimización
1. ¿Qué estrategias usarías para optimizar una aplicación Angular con 10,000+ componentes?
2. Explica el concepto de "bundle splitting" y cómo lo implementarías
3. ¿Cómo debuggearías memory leaks en una aplicación Angular?

### 4.5 Testing
1. ¿Cuál es tu estrategia para testing de componentes que usan NgRx?
2. ¿Cómo testearías animaciones y interacciones complejas?
3. ¿Qué herramientas usarías para testing E2E en esta aplicación?

---

## Criterios de Evaluación

### Excelente (90-100%)
- Código limpio, bien estructurado y documentado
- Implementación completa de todos los requisitos
- Uso avanzado de TypeScript y Angular
- Optimizaciones de rendimiento implementadas
- Tests comprehensivos
- Arquitectura escalable y mantenible

### Bueno (70-89%)
- Implementación funcional de la mayoría de requisitos
- Código bien organizado con algunas mejoras menores
- Uso correcto de Angular y TypeScript
- Algunas optimizaciones implementadas
- Tests básicos incluidos

### Aceptable (50-69%)
- Implementación básica que cumple requisitos mínimos
- Código funcional pero con oportunidades de mejora
- Uso básico de Angular
- Pocas o ninguna optimización
- Tests mínimos o ausentes

### Insuficiente (<50%)
- Implementación incompleta o no funcional
- Código desorganizado o con errores graves
- Uso incorrecto de tecnologías
- Sin consideraciones de rendimiento
- Sin tests

---

## Instrucciones de Entrega

### Repositorio Git
- Crear repositorio público en GitHub/GitLab
- Commits descriptivos y organizados
- README.md con instrucciones de instalación y ejecución
- Documentación de decisiones técnicas

### Estructura del Proyecto
```
talor-ui-test/
├── README.md
├── package.json
├── src/
│   ├── app/
│   │   ├── smart-navigation/
│   │   ├── store/
│   │   └── shared/
│   ├── assets/
│   └── environments/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PERFORMANCE_ANALYSIS.md
│   └── ANSWERS.md
└── tests/
```

### Documentación Requerida
1. **README.md**: Setup, comandos, y overview del proyecto
2. **ARCHITECTURE.md**: Decisiones de arquitectura y patrones usados
3. **PERFORMANCE_ANALYSIS.md**: Análisis del ejercicio 3.1 y optimizaciones
4. **ANSWERS.md**: Respuestas a preguntas conceptuales

### Tiempo Límite
- **Entrega:** 5 días calendario desde recepción
- **Presentación:** 30 minutos para explicar solución (opcional)

---

## Recursos Permitidos

✅ **Permitido:**
- Documentación oficial de Angular, NgRx, GSAP
- Stack Overflow y recursos de desarrollo
- Librerías de UI (Angular Material, PrimeNG, etc.)
- Herramientas de desarrollo estándar

❌ **No permitido:**
- Colaboración con otras personas

---

## Contacto

Para dudas sobre la prueba técnica:
- **Email:** [tu-email@empresa.com]
- **Horario de consultas:** Lunes a Viernes, 9:00-18:00
- **Tiempo de respuesta:** Máximo 24 horas

---

**¡Buena suerte! Esperamos ver tu creatividad y habilidades técnicas en acción.**
