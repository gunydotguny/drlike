// pages/_app.tsx
import Head from "next/head";
import { AppProps } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { RecoilRoot } from "recoil";
import "../styles/main.css";
import "swiper/css";
import "swiper/css/pagination";
import { theme } from "../themes/theme";
import { useRouter } from "next/router";
import { CacheProvider, EmotionCache, Global } from "@emotion/react";
import { createEmotionCache } from "../utils";
import reset from "../styles/reset";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  BarController,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  Tooltip,
  Legend,
  RadialLinearScale,
  PieController,
  DoughnutController,
} from "chart.js";
import Script from "next/script";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

declare global {
  interface Window {
    webkit?: any;
    ReactNativeWebView?: any;
  }
}

ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  PieController,
  DoughnutController,
  Tooltip,
  Legend
);

const clientSideEmotionCache = createEmotionCache();
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const router = useRouter();
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta charSet="utf-8" />
        <title>Dr.LIKE</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
        <meta name="description" content="1@" />
        <meta property="og:title" content="Dr.LIKE" />
        <meta property="og:description" content="1@" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content="https://1@" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Dr.LIKE" />
        <meta name="twitter:description" content="1@" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
        <link rel="manifest" href="/images/favicon/manifest.json" />
        {/* 앱 아이콘은 그대로 유지 */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
      </Head>

      {/* ✅ next/script로 외부 스크립트 로드 */}
      <Script src="https://js.pusher.com/3.2/pusher.min.js" strategy="beforeInteractive" />
      <Script src="https://code.jquery.com/jquery-1.12.4.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.iamport.kr/js/iamport.payment-1.1.8.js" strategy="beforeInteractive" />

      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Global styles={reset} />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Component {...pageProps} key={router.route} />
          </LocalizationProvider>
        </ThemeProvider>
      </RecoilRoot>
    </CacheProvider>
  );
}

export default MyApp;
