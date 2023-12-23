import User from "./User";
import Operation from "./Operation";
import ClockIn from "./ClockIn";
import FieldValue from "./FieldValue";

type ClockInEmployee = {
  '@id': string;
  id: string;
  fieldValues: FieldValue[];
  clockIns: ClockIn[];
  operation: Operation;
};

export default ClockInEmployee;