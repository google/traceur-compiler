import {Anno} from './setup.js';

@Anno
export function exportedAnnotated(@Anno x) {
}

export function exportedUnannotated(@Anno x) {
}
