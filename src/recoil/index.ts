import { atom } from "recoil";
import { v1 } from "uuid";
import _ from "lodash";
import { users } from "../datas/user";

export type NotificationProps = {
  id: string,
  target: string
};

export const userState = atom<any | null>({
  key: `userState/${v1()}`,
  default: users[_.findIndex(users, (el) => el.id === '4')]
});
