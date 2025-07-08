import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  keyframes,
} from '@angular/animations';
export const smartNavigationAnimations = [
  trigger('modalAnimation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'scale(0.8)',
        backdropFilter: 'blur(0px)',
      }),
      animate(
        '300ms cubic-bezier(0.35, 0, 0.25, 1)',
        style({
          opacity: 1,
          transform: 'scale(1)',
          backdropFilter: 'blur(4px)',
        })
      ),
    ]),
    transition(':leave', [
      animate(
        '250ms cubic-bezier(0.35, 0, 0.25, 1)',
        style({
          opacity: 0,
          transform: 'scale(0.8)',
          backdropFilter: 'blur(0px)',
        })
      ),
    ]),
  ]),

  trigger('searchResultsAnimation', [
    transition('* => *', [
      query(
        ':enter',
        [
          style({
            opacity: 0,
            transform: 'translateY(20px) scale(0.95)',
          }),
          stagger(50, [
            animate(
              '300ms cubic-bezier(0.35, 0, 0.25, 1)',
              keyframes([
                style({
                  opacity: 0,
                  transform: 'translateY(20px) scale(0.95)',
                  offset: 0,
                }),
                style({
                  opacity: 0.7,
                  transform: 'translateY(-5px) scale(1.02)',
                  offset: 0.7,
                }),
                style({
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                  offset: 1,
                }),
              ])
            ),
          ]),
        ],
        { optional: true }
      ),

      query(
        ':leave',
        [
          stagger(30, [
            animate(
              '200ms ease-in',
              style({
                opacity: 0,
                transform: 'translateX(-20px) scale(0.9)',
              })
            ),
          ]),
        ],
        { optional: true }
      ),
    ]),
  ]),
];
