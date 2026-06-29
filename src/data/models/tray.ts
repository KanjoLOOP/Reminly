/**
 * Bandeja de recuerdos: capturas rápidas que aún no están en ninguna libreta.
 * Se convierten en página (elementos del lienzo) cuando el usuario quiere.
 */
export type TrayItem =
  | { id: string; kind: 'photo'; uri: string; createdAt: string }
  | { id: string; kind: 'video'; uri: string; createdAt: string }
  | {
      id: string;
      kind: 'audio';
      uri: string;
      durationMs: number;
      createdAt: string;
    }
  | { id: string; kind: 'text'; text: string; createdAt: string };
