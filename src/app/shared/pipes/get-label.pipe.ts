import { Pipe, PipeTransform } from '@angular/core';

interface ArgumentPipe {
  options?: any[];
  key?: string;
  value?: string;
}

// GET LABEL FROM DROPDOWN DATA

@Pipe({
  name: 'getLabel',
  standalone: true,
  pure: false
})
export class GetLabelPipe implements PipeTransform {
  result: any;

  transform(value: any, arg: ArgumentPipe): any {
    this.updateValue(value, arg);
    return this.result;
  }

  updateValue(value: any, arg: ArgumentPipe) {
    if (!arg || value === undefined || value === null) {
      this.result = '';
      return this.result;
    }
    const key: string = arg.key ?? 'code';
    const label: string = arg.value ?? 'name';
    const item = arg.options?.find((e: any) => e[key] === value);
    this.result = item && item[label] ? item[label] : '---';
    return this.result;
  }
}
