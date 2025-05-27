import { SxProps } from "@mui/material";
import Typography from "@mui/material/Typography";
type TypoProps = {
  variant?: any;
  disabled: boolean;
  textAlign?: "center" | "right" | undefined;
  lines?: number;
  children?: React.ReactNode;
  sx?: SxProps;
  className?: any;
};
export default function Typo({
  variant,
  textAlign,
  lines,
  children,
  sx,
  className,
}: TypoProps) {
  return (
    <Typography
      component="div"
      variant={variant}
      sx={
        typeof lines === "number"
          ? {
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              lineClamp: lines,
              WebkitLineClamp: lines,
              whiteSpace: "pre-line",
              wordBreak: "keep-all",
              textAlign: textAlign,
              ...sx,
            }
          : {
              wordBreak: "keep-all",
              textAlign: textAlign,
              ...sx,
            }
      }
      className={className}
    >
      {children}
    </Typography>
  );
}

Typo.defaultProps = {
  disabled: false,
};
