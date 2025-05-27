import { Box, Button, Container, InputBase, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import OpenAI from "openai";
import { grey } from "@mui/material/colors";

const apiKey = "up_eQz8t6MFedgOonUEnecs5nu1sUyAk";
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.upstage.ai/v1",
  dangerouslyAllowBrowser: true,
});

export default function App() {
  return (
    <></>
  );
}
