import { css } from "@emotion/react";

const reset = css`
@charset "UTF-8";.blind,.filter_box .option input {
  clip: rect(0,0,0,0);
  height: 1px;
  margin: -1px!important;
  overflow: hidden;
  padding: 0!important;
  position: absolute;
  width: 1px
}

.page_header .title_wrapper .desc.p1 .editor_img_text,.post_content_wrap .editor_img_text,.related_wrap .related_list {
  *zoom:1}

.page_header .title_wrapper .desc.p1 .editor_img_text:after,.page_header .title_wrapper .desc.p1 .editor_img_text:before,.post_content_wrap .editor_img_text:after,.post_content_wrap .editor_img_text:before,.related_wrap .related_list:after,.related_wrap .related_list:before {
  content: " ";
  display: table
}

.page_header .title_wrapper .desc.p1 .editor_img_text:after,.post_content_wrap .editor_img_text:after,.related_wrap .related_list:after {
  clear: both
}

:not(input):not(textarea) {
  -webkit-touch-callout: none
}

body,button,dd,dl,dt,fieldset,form,h1,h2,h3,h4,h5,h6,input,legend,li,ol,p,select,table,td,textarea,th,ul {
  margin: 0;
  padding: 0
}

body,html {
  color: #000;
  height: 100%;
  height: 100vh;
  min-height: 100%
}

html {
  -webkit-text-size-adjust: 100%;
  font-size: 10px;
  line-height: 10px;
}

body {
  width: 100%;
  -webkit-overflow-scrolling: touch;
  background-color: #F6F7F9;
  font-size: 15px;
  font-weight: 400;
  line-height: 19px
}

* {
  // letter-spacing: -0.4px !important;
  letter-spacing: -0.2px !important;
  // font-family: 'LINESeedKR' !important
  font-family: Pretendard !important
}

body,code,html,kbd,pre,samp {
  font-family: Pretendard, Noto Sans KR,-apple-system,BlinkMacSystemFont,Roboto,Yu Gothic,Helvetica Neue,sans-serif
}

html:lang(en),html:lang(en) body,html:lang(en) code,html:lang(en) kbd,html:lang(en) pre,html:lang(en) samp {
  font-family: system-ui,-SF Pro Text,Helvetica,Roboto,sans-serif
}

html:lang(ja),html:lang(ja) body,html:lang(ja) code,html:lang(ja) kbd,html:lang(ja) pre,html:lang(ja) samp {
  font-family: Hiragino Sans,-apple-system,BlinkMacSystemFont,Roboto,Yu Gothic,Helvetica Neue,sans-serif
}

pre {
  word-wrap: break-word;
  white-space: pre-wrap
}

address {
  font-style: normal
}

fieldset,img {
  border: 0
}

dl,ol,ul {
  list-style: none
}

a {
  color: inherit;
  cursor: pointer;
  text-decoration: none
}

table {
  border-collapse: collapse
}

caption {
  font-size: 0;
  height: 0;
  line-height: 0;
  visibility: hidden;
  width: 0
}

input {
  border: 0;
  padding: 0
}

input[type=search] {
  -webkit-appearance: textfield
}

button {
  cursor: pointer
}

button span {
  position: relative
}

button:disabled {
  cursor: default
}

button,input,select,textarea {
  -webkit-appearance: none;
  background-color: transparent;
  border: 0;
  border-radius: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-family: inherit
}

img {
  height: auto;
  vertical-align: top;
  width: 100%
}

input[type=search]::-ms-clear,input[type=search]::-ms-reveal {
  display: none;
  height: 0;
  width: 0
}

input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration,input[type=search]::-webkit-search-results-button,input[type=search]::-webkit-search-results-decoration {
  display: none
}
  #__next {
    height: 100%;
    width: 100%;
    --sat: var(--sait);
    --sar: var(--sair);
    --sab: var(--saib);
    --sal: var(--sail);
  }
`;

export default reset;