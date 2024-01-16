import { IconKey } from "../services/utils";

type Notification = {
    title: string;
    content: string;
    icon: IconKey;
    createdAt: string;
};

export default Notification;