import { Box } from "@mui/material";
import { SIDENAV_WIDTH } from "./SideNav";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Box sx={{
            pl: SIDENAV_WIDTH,
            minHeight: "100vh",

        }}>
            <Box sx={{
                minWidth: 1200,
                maxWidth: 1200, mx: "auto",
            }}>
                {children}
            </Box>
        </Box>
    );
}
