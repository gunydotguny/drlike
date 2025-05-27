import _ from "lodash";
import createCache from "@emotion/cache";
export function createEmotionCache() {
  return createCache({ key: "css" });
}
export function isEmail(asValue: string | null) {
  if (typeof asValue !== "string") return false;
  var regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
  return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}
export function isCelluar(asValue: string | null) {
  if (typeof asValue !== "string") return false;
  var regExp = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
  return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}
export function isPassword(asValue: string | null) {
  if (typeof asValue !== "string") return false;
  var regExp =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d$!@#$%^&*()]{6,}$/; //  6 ~ 20자 영문, 숫자 조합
  return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}
export function isPhone(asValue: string | null) {
  if (typeof asValue !== "string") return false;
  var regExp = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
  return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}
export function isByte(str: string, maxByte: number) {
  var str_len = str.length;
  var rbyte = 0;
  var rlen = 0;
  var one_char = "";
  for (var i = 0; i < str_len; i++) {
    one_char = str.charAt(i);
    if (escape(one_char).length > 4) {
      rbyte += 2; //한글2Byte
    } else {
      rbyte++; //영문 등 나머지 1Byte
    }
    if (rbyte <= maxByte) {
      rlen = i + 1; //return할 문자열 갯수
    }
  }
  return rbyte <= maxByte;
}
export function getByte(str: string) {
  var str_len = str.length;
  var rbyte = 0;
  var one_char = "";
  for (var i = 0; i < str_len; i++) {
    one_char = str.charAt(i);
    if (escape(one_char).length > 4) {
      rbyte += 2; //한글2Byte
    } else {
      rbyte++; //영문 등 나머지 1Byte
    }
  }
  return rbyte;
}
export const comma = (number: number) => {
  var num, len, point, str;
  num = `${number}`;
  point = num.length % 3;
  len = num.length;
  str = num.substring(0, point);
  while (point < len) {
    if (str != "") str += ",";
    str += num.substring(point, point + 3);
    point += 3;
  }
  return str;
};
export function displayedAt(str: string | null, short?: boolean) {
  const date = str === null ? new Date() : new Date(str);
  const dateTime = str === null ? 0 : new Date(str).getTime();
  const milliSeconds = new Date().getTime() - dateTime;
  const seconds = milliSeconds / 1000;
  if (seconds < 60) return `방금 전`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}분 전`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}시간 전`;
  const days = hours / 24;
  if (short) return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${
    short ? `` : ` ${date.getHours()}시 ${date.getMinutes()}분`
  }`;
  // if (days < 7) return `${Math.floor(days)}일 전`;
  // const weeks = days / 7;
  // if (weeks < 5) return `${Math.floor(weeks)}주 전`;
  // const months = days / 30;
  // if (months < 12) return `${Math.floor(months)}개월 전`;
  // const years = days / 365;
  // return `${Math.floor(years)}년 전`;
}
export function setKoNumber(number: number) {
  var pWon = comma(number);
  var won = `${pWon}`.replace(/,/g, "");
  var arrWon = [" ", "만 ", "억 ", "조 "];
  var pattern = /(-?[0-9]+)([0-9]{4})/;
  var changeWon = "";
  while (pattern.test(won)) {
    won = won.replace(pattern, "$1,$2");
  }
  var arrCount = won.split(",").length - 1;
  for (var ii: number = 0; ii < won.split(",").length; ii++) {
    if (arrWon[arrCount] === undefined) {
      break;
    }
    var tempWon = 0;
    for (var i: number = 0; i < won.split(",")[ii].length; i++) {
      var num1 = won.split(",")[ii].substring(i, i + 1);
      tempWon = tempWon + Number(num1);
    }
    if (tempWon > 0) {
      changeWon += comma(Number(won.split(",")[ii])) + arrWon[arrCount];
    }
    arrCount--;
  }
  return changeWon.slice(0, -1);
}
