import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import useSWR, { mutate } from "swr";

import axios, { AxiosRequestConfig } from "axios";
export const API_URL = "https://api-python.circlin.co.kr/api";
const options = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
export function useAxios(
  url: string,
  config?: AxiosRequestConfig,
  withCredentials = true
) {
  return axios(url.includes(`http`) ? url : `${API_URL}${url}`, {
    ...config,
    withCredentials: withCredentials,
    headers: {
      ...config?.headers,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).catch((res) => {
    return res.response;
  });
}
export const fetcher = (url: string, options?: any) =>
  useAxios(url, options)
    .then((res) => res.data)
    .catch((e) => {
      alert("fetch error " + e);
      history.back();
    });
export function useCustomSWR(url: string | null) {
  const { data, error, isValidating, mutate } = useSWR(
    url?.includes("http") ? url : `${API_URL}${url}`,
    fetcher,
    options
  );
  function returnStates(data: any, error: any, mutate: any, isValidating: any) {
    return {
      data: {
        data: data,
        isLoading: !error && !data,
        error: error || data === undefined ? true : false,
        mutate: mutate,
        isValidating: isValidating,
      },
    };
  }
  return returnStates(data, error, mutate, isValidating);
}
export const setInfiniteKey = (url: string | null) => {
  const api = url?.includes("http") ? url : `${API_URL}${url}`;
  const getKey: SWRInfiniteKeyLoader = (index, previousPageData) => {
    if (url === null) return null;
    if (previousPageData && !previousPageData.data.length) return null; // 끝에 도달
    if (index === 0) return `${api}`;
    return `${api}${api?.includes("?") ? `&` : `?`}page=${index}&cursor=${previousPageData.next
      }`;
  };
  return getKey;
};
export function useCustomSWRInfinite(getKey: any) {
  const { data, error, isValidating, mutate, size, setSize } = useSWRInfinite(
    getKey,
    fetcher,
    options
  );
  function returnStates(
    data: any,
    error: any,
    mutate: any,
    isValidating: any,
    size: any,
    setSize: any
  ) {
    return {
      data: {
        data: data,
        isLoading: !error && !data,
        error: error || !data ? true : false,
        mutate: mutate,
        isValidating: isValidating,
        isLoadingMore:
          (!error && !data) ||
          (size > 0 && data && typeof data[size - 1] === "undefined"),
        isRefreshing: isValidating && data && data.length === size,
        size: size,
        setSize: setSize,
      },
    };
  }
  return returnStates(data, error, mutate, isValidating, size, setSize);
}
