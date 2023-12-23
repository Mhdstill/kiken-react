import User from "./User";
import Operation from "./Operation";
import ClockInEmployee from "./ClockInEmployee";
import FieldValue from "./FieldValue";

type ClockIn = {
  '@id': string;
  id: string;
  operation: Operation;
  clockInEmployee: ClockInEmployee;
  start: Date;
  end: Date;
  fieldValues: FieldValue[];
};

export default ClockIn;