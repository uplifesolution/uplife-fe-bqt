import { ValidationErrors } from '@angular/forms';
import { ValidatorMessage } from '../interfaces/validator-message';
import { Constants } from '@/helpers/constants';

export class Utils {
  static getErrorMessage(label: string, errors?: ValidationErrors | null) {
    const objMessage: ValidatorMessage = {
      key: 'EMPTY',
      required: {
        label: label,
        requiredLength: null,
        min: null,
        max: null,
        count: null,
        type: null,
        maxDateLabel: null,
        minDateLabel: null
      }
    };
    if (!errors) {
      return objMessage;
    }
    const errorKey = Object.keys(errors as object)[0];
    const errorValue: any = errors[errorKey];
    objMessage.key = `validateError.${errorKey}`;
    objMessage.required = { ...objMessage.required, ...errorValue };
    return objMessage;
  }

  static isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  static isEmpty(value: any) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (!(value instanceof Date) && typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  static isNotEmpty(value: any) {
    return !this.isEmpty(value);
  }

  static dataTablePreLoad() {
    let data: any[] = [];
    for (let i = 0; i < Constants.PageSize; i++) {
      data.push({});
    }
    return data;
  }

  static removeParamNullOrUndefined(params: any) {
    const newParams: any = {};
    Object.entries(params).forEach(([key, value]) => {
      if (!Utils.isNull(value) || Utils.isNotEmpty(value)) {
        newParams[key] = value;
      }
    });
    return newParams;
  }

  static isAllPropsNotEmpty(obj: Record<string, any>): boolean {
    return Object.values(obj).every(
      value =>
        value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '')
    );
  }
}
