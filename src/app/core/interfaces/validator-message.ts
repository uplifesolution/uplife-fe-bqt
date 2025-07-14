export interface ValidatorMessage {
  key: string;
  required: {
    label: string;
    requiredLength: null | number;
    min: null | number;
    max: null | number;
    maxDateLabel: string | null;
    minDateLabel: string | null;
    count: number | null;
    type: string | null;
  };
}
