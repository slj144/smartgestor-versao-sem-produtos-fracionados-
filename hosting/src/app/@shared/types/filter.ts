
export type filter = { 
  filter: object;
  info: {
    label: string;
    value: any;
  };
  settings: { 
    combination: ('full'|'partial');
    operator: ('<='|'<'|'='|'>'|'>=');
    nested: boolean;
  };
};
