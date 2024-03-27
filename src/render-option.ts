// Types
// Render option types
export interface RenderOptionObject {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

enum RenderOperation {
  StatusOnly = 'StatusOnly',
  Standard = 'Standard',
}

export type RenderToken = RenderOperation;

export type RenderAppOption = RenderToken | RenderOptionObject;
