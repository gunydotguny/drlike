import { alpha, Box, ButtonBase, Stack, Typography } from "@mui/material"
import GridViewIcon from '@mui/icons-material/GridView';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import { useRouter } from "next/router";
import { purple, blueGrey } from "@mui/material/colors";

export const SIDENAV_WIDTH = '80px';

const pages = [
    { path: '/matrix', label: 'Matrix', icon: 'gridview' },
    { path: '/news', label: 'News', icon: 'article' },
]

export default function SideNav() {
    const router = useRouter();
    if (router.pathname === '/') return null;
    return <Box sx={{
        width: SIDENAV_WIDTH,
        backgroundColor: '#ffffff',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        pt: 2,
        zIndex: 999,
        '@media (max-width: 768px)': {
            top: 'initial',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            p: 0,
                            borderTop: `1px solid ${blueGrey[100]}`
        }
    }}>
        <Stack spacing={1} alignItems={'center'} sx={{
            flexDirection: 'column',
            '@media (max-width: 768px)': {
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
            }
        }}>
            {pages.map((item, index) => {
                return <SideNavItem key={index} {...item} />
            })}
        </Stack>
    </Box>
}

const SideNavItem = (item: any) => {
    const router = useRouter();
    const focused = router.asPath.startsWith(item.path);
    const handleClick = () => {
        router.push(item.path);
    }
    return <ButtonBase
        onClick={handleClick}
        sx={{
            width: "56px",
            height: "56px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? purple[500] : 'transparent',
            borderRadius: 1,
            boxShadow: focused ? `4px 4px 16px ${alpha(purple[500], 0.4)}` : 'none',
            transition: 'all 0.3s ease',
            ' *': {
                transition: 'all 0.3s ease',
            },
            '@media (max-width: 768px)': {
                width: '100%',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                mt: `0px !important`,
                borderRadius: 0
            }
        }}>
        {item.icon === 'gridview' ?
            <Box sx={{
                mt: 0.25,
                width: 24,
                height: 24,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <GridViewIcon
                    sx={{
                        fontSize: 24,
                        color: focused ? '#ffffff' : blueGrey[200],
                        '@media (max-width: 768px)': {
                            color: focused ? purple[500] : blueGrey[200]
                        }
                    }}
                />
            </Box>
            :
            <Box sx={{
                mt: 0.25,
                width: 24,
                height: 24,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <SplitscreenIcon
                    sx={{
                        fontSize: 24,
                        color: focused ? '#ffffff' : blueGrey[200],
                        '@media (max-width: 768px)': {
                            color: focused ? purple[500] : blueGrey[200]
                        }
                    }}
                />
            </Box>
        }
        <Typography sx={{
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 700,
            color: focused ? '#ffffff' : blueGrey[200],
            '@media (max-width: 768px)': {
                color: focused ? purple[500] : blueGrey[200]
            }
        }}>
            {item.label}
        </Typography>
    </ButtonBase>
}
