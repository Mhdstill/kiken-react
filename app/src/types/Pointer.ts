import User from "./User";
import Operation from "./Operation";

type Pointer = {
  '@id': string;
  id: string;
  operation: Operation;
  person: User;
  start: Date;
  end: Date;
};

export default Pointer;