import { alpha, Box, ButtonBase, Stack, Typography } from "@mui/material"
import GridViewIcon from '@mui/icons-material/GridView';
import ArticleIcon from '@mui/icons-material/Article';
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
    }}>
        <Stack direction={'column'} spacing={1} alignItems={'center'}>
            {pages.map((item, index) => {
                return <SideNavItem key={index} {...item} />
            })}
        </Stack>
    </Box>
}

const SideNavItem = (item: any) => {
    const router = useRouter();
    const focused = router.pathname === item.path;
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
            }
        }}>
        {item.icon === 'gridview' ?
            <GridViewIcon
                sx={{
                    mt: 0.25,
                    fontSize: 24,
                    color: focused ? '#ffffff' : blueGrey[200]
                }}
            /> :
            <ArticleIcon
                sx={{
                    mt: 0.25,
                    fontSize: 24,
                    color: focused ? '#ffffff' : blueGrey[200]
                }}
            />
        }
        <Typography sx={{
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 700,
            color: focused ? '#ffffff' : blueGrey[200]
        }}>
            {item.label}
        </Typography>
    </ButtonBase>
}
