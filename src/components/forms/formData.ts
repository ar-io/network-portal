import { RowType } from './FormRow';

// Currently not using as rowDefs can change relative to context of non-form state,
// leaving here for further development
// export interface FormState {
//     values: Record<string, string>;
//     errors: Record<string, string>;
//     rowDefs:Array<FormRowDef>
// }

export interface FormRowDef {
  /** Key used in formState or formError objects to retrieve value or error messages. */
  formPropertyName: string;
  /** Label to display to the user in FormRow.  */
  label: string;
  /** Affects kind of border to show for FormRow when editing (rounded top, bottom, both, none). */
  rowType?: RowType;
  /** Optional Element to show left of the text field. */
  leftComponent?: JSX.Element;
  /** Optional Element to show right of the text field. */
  rightComponent?: JSX.Element;
  /** Determines if an editable field is currently enabld or not. For a field that is non-editable, use
   * the readOnly property instead. */
  enabled?: boolean;
  /** Placeholder text to use for text field. */
  placeholder?: string;
  /** Form validation function. Returns an error message or undefined if value is valid. Required unless
   * row is readOnly. Will not be called when row is not enabled.*/
  validateProperty?: (value: string) => string | undefined;
  /** Marks the row as non-editable and for display purposes only. */
  readOnly?: boolean;
}

export const isFormValid = ({
  formRowDefs,
  formValues,
}: {
  formRowDefs: Array<FormRowDef>;
  formValues: Record<string, string | boolean>;
}) => {
  return formRowDefs.every((rowDef) => {
    const value = formValues[rowDef.formPropertyName];
    // enabled value can be true, false, or undefined. We shortcircuit and accept the row
    // as valid here only if the row definition is explicity set to false.
    if (
      rowDef.enabled == false ||
      rowDef.readOnly ||
      typeof value === 'boolean'
    ) {
      return true;
    }

    if (rowDef.validateProperty === undefined) {
      throw new Error(
        `FormRowDef for ${rowDef.formPropertyName} is missing a validateProperty function.`,
      );
    }

    const errorMessage = rowDef.validateProperty(value);
    return errorMessage === undefined;
  });
};

export const calculateNumFormChanges = ({
  initialState,
  formState,
}: {
  initialState: Record<string, string | boolean>;
  formState: Record<string, string | boolean>;
}) => {
  let numChanges = 0;
  for (const key in formState) {
    if (formState[key] !== initialState[key]) {
      numChanges++;
    }
  }
  return numChanges;
};
