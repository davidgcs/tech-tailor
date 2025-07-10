# PARTE 4: Preguntas Conceptuales (30 minutos)

## 4.1 Angular Avanzado

### Explica la diferencia entre OnPush y Default change detection y cuándo usar cada uno

El Default strategy revisa todos los componentes cada vez que ocurre un evento, mientras que OnPush solo revisa cuando cambian los inputs o se dispara un evento en el componente, esto afecta directamente a la recarga del template y al tiempo de respuesta de la ui.

La idea es utilizar Default cuando hay componentes simples sin mucha lógica y OnPush para componentes con datos que no cambian frecuentemente o cuando se necesita optimizar el performance. La ventaja de usar OnPush es que se puede llamar a ChangeDetectorRef.markForCheck() cuando cambies algo manualmente para controlar personalmente cuando quieres que se recarguen los datos, sin afectar al funcionamiento normal ya que por ejemplo los inputs, forms y otras acciones standard se siguen recargando cuando cambia el origen de sus datos.

### ¿Cómo implementarías lazy loading de módulos con pre-loading strategy?

Para implementar lazy loading se configuran las rutas usando loadChildren:

``` typescript
{
  path: 'feature',
  loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
}
``` typescript
Para preloading hay que llamar a PreloadAllModules en el router o crear una estrategia custom:

``` typescript
RouterModule.forRoot(routes, { 
  preloadingStrategy: PreloadAllModules 
})
```

### ¿Cuál es la diferencia entre ViewChild y ContentChild?

ViewChild busca elementos dentro del template del componente, ContentChild busca en el contenido proyectado con `<ng-content>`.

ViewChild para acceder a elementos de mi propio template, ContentChild para elementos que vienen del componente padre por content projection. La diferencia clave es dónde está definido el HTML: en el template o proyectado desde afuera

## 4.2 RxJS y Observables

### Operadores de Transformación: Explica las diferencias entre switchMap, mergeMap, concatMap y exhaustMap. Proporciona un ejemplo de cuándo usarías cada uno

- **switchMap** Cancela el observable anterior cuando llega uno nuevo. Perfecto para búsquedas donde solo importa el último resultado

- **mergeMap** Ejecuta todos los observables en paralelo. Uso para operaciones independientes como peticiones múltiples

- **concatMap** Espera a que termine el anterior antes del siguiente. Para operaciones secuenciales

- **exhaustMap** Ignora nuevos valores mientras el anterior no termine. Útil para evitar clicks múltiples en botones

### Manejo de Errores: ¿Cómo manejarías errores en una cadena de observables sin romper el stream? Muestra un ejemplo con catchError

``` typescript
this.http.get('/api/data').pipe(
  catchError(error => {
    console.error(error);
    throw 'error in source. Details: ' + error.message;
  })
)
```

### Memory Leaks: Identifica y explica cómo prevenir memory leaks en este código

``` typescript
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

No se destruyen los observables. Cada vez que se genere el componente se va a crear un intervalo nuevo con un proceso que muestre un log cada segundo haciendo que se dupliquen esos logs.

``` typescript
@Component({...})
export class MyComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  data$ = new BehaviorSubject<any[]>([]);

  ngOnInit() {
    this.subscriptions.add(
      this.service.getData().subscribe(data => this.data$.next(data))
    );

    this.subscriptions.add(
      interval(1000).subscribe(() => console.log('Timer tick'))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
```

de esta forma añadimos todos los procesos en un array de subscriptions y añadimos al ciclo de vida del componente en el onDestroy una simple llamada a unsubscribe(), de esta manera nos aseguramos que los procesos no se queden en memoria y se destruyan con el propio componente. También se podría usar el takeUntil() de RxJs

### Combinación de Observables: Implementa una función que combine dos observables donde

- El primero emite cada 2 segundos
- El segundo emite cuando el usuario hace click
- Solo quieres el valor más reciente de ambos cuando cualquiera emite

``` typescript
    const timer$ = interval(2000).pipe(
      startWith(-1),
      map(val => `Timer: ${val}`)
    );

    const clicks$ = fromEvent(document, 'click').pipe(
      startWith(null),
      map((_, i) => `Click en: ${new Date().toLocaleTimeString()}`)
    );

    combineLatest([timer$, clicks$]).subscribe(([timer, click]) => {
      // Esto se ejecuta cada vez que clicks$ o timer$ emite un valor, siempre obtenemos el valor más reciente de ambos
    });
```

## 4.3 NgRx y Estado

### ¿Cuándo recomendarías usar NgRx vs servicios simples con BehaviorSubject?

Por lo general NgRx añade una capa de complejidad que no siempre es necesaria ya que el coste y la curva de desarrollo se incrementan por el hecho de añadir redux. Tan solo en el caso de que se requiera trabajar con un estado complejo de la aplicación, muchos
datos o hay que mantener un historial de los estados anteriores como puede ser el desarrollo de un chatbot, una aplicación compleja de marketplace o una gran cantidad de datos que implicaría que el intercambio de información entre servicios fuera
a dar más problemas y en ese caso valdría la pena implementar un sistema para gestionar un estado centralizado.

Utilizar signals o behaviourSubject funciona muy bien con aplicaciones en las que la mayoría de su flujo de datos se encuentra en la base de datos o en el backend donde pueden apoyarse a través de una api para acceder a esos recursos de manera organizada y no van a tender a cambiar con frecuencia. Sin embargo cuando esos datos se generan en el propio frontal como en el ejemplo anterior de un chat ese modelo de trabajo generaría un flujo de llamadas constante que puede volverse muy dificil de seguir a través de los eventos porque podrían ocurrir multiples eventos al mismo tiempo y bloquearse entre ellos, además realizar muchas llamadas y depender de la velocidad de respuesta del backend puede ralentizar mucho la navegación en el frontal aunque este esté bien optimizado, aquí entrarían las ventajas de redux frente a observables.

### Explica el patrón de Entity Adapter y sus beneficios

Entity Adapter simplifica el manejo de colecciones normalizadas

``` typescript
const adapter = createEntityAdapter<User>();

const initialState = adapter.getInitialState();

const reducer = createReducer(
  initialState,
  on(addUser, (state, { user }) => adapter.addOne(user, state))
);
```

Gracias al adapter podemos acceder a ciertos métodos como addOne, updateOne, removeOne sin tener que crearlos a mano

### ¿Cómo manejarías el estado de formularios complejos con NgRx?

Crearía acciones independientes para los campos clave del formulario, por ejemplo: updateNombre, updateEmail, updateDireccion. Esto permite que cada cambio en el formulario se refleje en el store de forma precisa y predecible. Con esto se pueden manejar validaciones, diferentes estados y errores.

Al Entity Adapters para listas dinámicas (como direcciones, teléfonos, productos, etc.) se facilita el agregar, actualizar o eliminar elementos de la lista sin mucho código extra.

Esto ayuda a mantener el estado normalizado y optimiza la selección y actualización de elementos individuales.

## 4.4 Performance y Optimización

### ¿Qué estrategias usarías para optimizar una aplicación Angular con 10,000+ componentes?

- OnPush change detection en todos los componentes posibles
- TrackBy functions en *ngFor/@for para evitar re-renderizados
- Activar lazy loading en cada ruta independiente o incluso componentes específicos
- Paginado de datos + carga secuencial, por ejemplo con un scroll infinito o por páginas pasando parámetros al backend para que nos devuelva los datos en bloques más pequeños
- Refactorización de servicios demasiado extensos o complejos, trabajar con un punto de vista centrado en la simplicidad y el single responsability. (keep it simply / don't repeat yourself)
- Activar eslint con reglas estrictas para evitar que se permitan injecciones de dependencias sin uso, variables que se declaran pero no se consumen, lineas de código excesivas, anidaciones de condicionales etc
- Valorar la implementación de sistemas almacenamiento de datos en caché

### Explica el concepto de "bundle splitting" y cómo lo implementarías

Es una técnica de optimización que divide tu aplicación en múltiples archivos JavaScript más pequeños (bundles), en lugar de uno solo grande. Esto permite cargar solo el código necesario en cada momento, mejorando el tiempo de carga inicial y la eficiancia general de la aplicación / web.

La manera nativa de gestionar el bundle splitting sería la aplicación del lazy loading previamente mencionado. Esto se puede aplicar a rutas custom o a componentes específicos.

``` typescript - app.routes.ts
{
  path: 'feature',
  loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
}
```

Al iniciar la aplicación cargará un bundle de datos js con toda la información que necesita mostrar la aplicación, salvo el contenido del componente "feature" que solo cargará cuando se acceda a la ruta /feature en el navegador.

### ¿Cómo debuggearías memory leaks en una aplicación Angular?

Usando Chrome DevTools en el navegador en el inspector de elementos (F12) hay una pestaña de rendimiento o "Performance" donde se puede ver los tiempos de carga, así mismo se puede ver en la pestaña "Network" si alguna llamada al servidor está bloqueando la ejecución por ser demasiado lenta o también podemos acceder a los archivos locales de la aplicación en la pestaña "Application" o ver la carga de los bundle js y su tamaño dentro de "Memory". También podemos emular un internet lento para poder comprobar que componentes son los que están tardando más en cargar. Otra forma sería directamente mirando en el código a ver si hay observables que no se eliminan o podemos utilizar herramientas externas como sonarqube o alguna de rendimiento

## Testing

### ¿Cuál es tu estrategia para testing de componentes que usan NgRx?

- MockStore para pruebas unitarias sin estado real
- Testear selectors por separado como funciones puras
- Mockear efectos y acciones
- Usar provideMockStore con estado inicial
- Testing Library para interacciones más realistas
- Jest permite testear distintos estados de la aplicación

### ¿Cómo testearías animaciones y interacciones complejas?

- NoopAnimationsModule para tests que no necesitan animaciones
- Testing directo de triggers con TestBed
- Verificar estados inicial y final con jest
- Mock del AnimationBuilder cuando sea necesario
- Focus en el comportamiento, no en los detalles visuales

### ¿Qué herramientas usarías para testing E2E en esta aplicación?

Tan solo conozco Cypress, es facil de utilizar y aunque tiene bastantes bugs sin sentido la curva de aprendizaje es muy amigable y ofrece buenos resultados
