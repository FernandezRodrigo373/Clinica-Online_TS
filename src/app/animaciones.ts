import { trigger, transition, style, query, group, animate, animateChild } from '@angular/animations';

export const animaciones = trigger('animaciones', [
  // Cambio de animacion1 a animacion2
  transition('animacion1 => animacion2', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top:0, left:0, width: '100%' }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.8)' }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('1200ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('2000ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ], { optional: true }),
    ]),
  ]),

  // Cambio de animacion2 a animacion1
  transition('animacion2 => animacion1', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top:0, left:0, width: '100%' }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('800ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' })),
      ], { optional: true }),
      query(':enter', [
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ], { optional: true }),
    ]),
  ]),

  // Animacion1 <=> animacion1 
  transition('animacion1 <=> animacion1', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top:0, left:0, width: '100%' }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('800ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' })),
      ], { optional: true }),
      query(':enter', [
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ], { optional: true }),
    ]),
  ]),

  // Animacion2 <=> animacion2 
  transition('animacion2 <=> animacion2', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top:0, left:0, width: '100%' }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.8)' }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('800ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('800ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ], { optional: true }),
    ]),
  ]),


]);