import { RowType } from './FormRow';

// Currently not using as rowDefs can change relative to context of non-form state,
// leaving here for further development
// export interface FormState {
//     values: Record<string, string>;
//     errors: Record<string, string>;
//     rowDefs:Array<FormRowDef>
// }

export interface FormRowDef {
  formPropertyName: string;
  label: string;
  rowType?: RowType;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  enabled?: boolean;
  placeholder?: string;
  validateProperty: (value: string) => string | undefined;
}

export const isFormValid = ({
  formRowDefs,
  formValues,
}: {
  formRowDefs: Array<FormRowDef>;
  formValues: Record<string, string>;
}) => {
  return formRowDefs.every((rowDef) => {
    // enabled value can be true, false, or undefined. We shortcircuit and accept the row
    // as valid here only if the row definition is explicity set to false.
    if (rowDef.enabled == false) {
      return true;
    }
    const errorMessage = rowDef.validateProperty(
      formValues[rowDef.formPropertyName],
    );
    return errorMessage === undefined;
  });
};
