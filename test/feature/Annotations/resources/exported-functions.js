import {Anno} from './setup';

@Anno
export function exportedAnnotated(@Anno x) {
}

export function exportedUnannotated(@Anno x) {
}
