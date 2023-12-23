import User from "./User";
import Operation from "./Operation";
import ClockIn from "./ClockIn";
import ClockInEmployee from "./ClockInEmployee";
import PointerField from "./PointerField";

type FieldValue = {
  '@id': string;
  id: string;
  custom_field: PointerField;
  value: string;
  clockInEmployee: ClockInEmployee;
  clockIn: ClockIn;
};

export default FieldValue;
