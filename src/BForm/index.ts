import { CheckboxGroup, Date, File, Select, Switch, Text, Textarea } from "../fields";
import { FileListField } from "../FileListField";

import { withFormField } from "./WithFormField";
import { ConnectionsField } from "../ConnectionsField";

export * from "./FieldPlaceholder";
export * from "./BForm";

export const BText = withFormField(Text);
export const BTextarea = withFormField(Textarea);
export const BSelect = withFormField(Select);
export const BSwitch = withFormField(Switch);
export const BCheckboxGroup = withFormField(CheckboxGroup);
export const BDate = withFormField(Date);
export const BFile = withFormField(File);
export const BConnectionsField = withFormField(ConnectionsField);
export const BFileListField = withFormField(FileListField);

export { withFormField };
