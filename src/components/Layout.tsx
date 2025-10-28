import { Box } from "@mui/material";
import { SIDENAV_WIDTH } from "./SideNav";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{
            pl: SIDENAV_WIDTH,
            minHeight: "100vh",
            '@media (max-width: 768px)': {
                pl: 0,
            }
        }}>
            <Box sx={{
                minWidth: 1200,
                maxWidth: 1200, mx: "auto",
                '@media (max-width: 768px)': {
                    minWidth: 'initial',
                    maxWidth: '100vw',
                    width: '100vw',
                    backgroundColor: '#ffffff',
                    pb: 12
                }
            }}>
                {children}
            </Box>
        </Box>
    );
}
