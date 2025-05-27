import { Box, Chip, SelectChangeEvent, Stack, Typography, alpha } from "@mui/material"
import { grey, red } from "@mui/material/colors"
import { GridCellParams, GridColDef, GridComparatorFn, GridFilterItem, GridRenderCellParams, getGridSingleSelectOperators, useGridApiContext } from "@mui/x-data-grid"
import { theme } from "../themes/theme"
import _ from "lodash"
import Icon from "../components/atoms/Icon"
import { users } from "./user"

const tagsSortComparator: GridComparatorFn<any> = (tags1: any, tags2: any) => {
    return tags1.length - tags2.length
}

const tagsFilterOperators = getGridSingleSelectOperators()
    .filter((operator) => operator.value === "isAnyOf")
    .map((operator) => {
        const newOperator = { ...operator }
        const newGetApplyFilterFn = (filterItem: GridFilterItem, column: GridColDef) => {
            return (params: any): boolean => {
                let isOk = true
                filterItem?.value?.forEach((fv: any) => {
                    isOk = isOk && params.value.includes(fv)
                })
                return isOk
            }
        }
        newOperator.getApplyFilterFn = newGetApplyFilterFn
        return newOperator
    })
function toggleEditInputCell(props: GridRenderCellParams) {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    const handleChange = async (event: SelectChangeEvent) => {
        await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
        apiRef.current.stopCellEditMode({ id, field });
    };
    console.log()
    return (
        <></>
    );
}

export const projectRows = [
    {

        "id": "1",
        "title": "MNGHA",
        "tags": ["covid-19", "test-02"],
        "responsibilty": "1",
        "dateCreated": new Date(),
        "cohorts": 10,
        "public": true,
        "color": '#d49516',
        "favorited": true,
        "manager": [],
        "editor": ['2'],
        "viewer": ['5']
    },
    {

        "id": "2",
        "title": "사우디아라비아 시연용",
        "tags": ["covid-19"],
        "responsibilty": "3",
        "dateCreated": new Date(),
        "cohorts": 9,
        "public": true,
        "color": '#16b4d4',
        "favorited": true,
        "manager": ["6", "7", "8", "9", "10"]
    },
    {

        "id": "3",
        "title": "Ray 녹내장분석",
        "tags": [],
        "responsibilty": "2",
        "dateCreated": new Date(),
        "cohorts": 1,
        "public": true,
        "color": '#9516d4',
        "favorited": false,
        "manager": ["6", "7", "8", "9", "10"]
    },
    // {

    //     "id": "4",
    //     "title": "MNGHA",
    //     "tags": ["covid-19", "test-02"],
    //     "responsibilty": "1",
    //     "dateCreated": new Date(),
    //     "cohorts": 10,
    //     "public": true,
    //     "color": '#d49516',
    //     "favorited": true,
    //     "manager": [],
    //     "editor": ['2'],
    //     "viewer": ['5']
    // },
    // {

    //     "id": "5",
    //     "title": "사우디아라비아 시연용",
    //     "tags": ["covid-19"],
    //     "responsibilty": "3",
    //     "dateCreated": new Date(),
    //     "cohorts": 9,
    //     "public": true,
    //     "color": '#16b4d4',
    //     "favorited": true,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
    // {

    //     "id": "6",
    //     "title": "Ray 녹내장분석",
    //     "tags": [],
    //     "responsibilty": "2",
    //     "dateCreated": new Date(),
    //     "cohorts": 1,
    //     "public": true,
    //     "color": '#9516d4',
    //     "favorited": false,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
    // {

    //     "id": "7",
    //     "title": "MNGHA",
    //     "tags": ["covid-19", "test-02"],
    //     "responsibilty": "1",
    //     "dateCreated": new Date(),
    //     "cohorts": 10,
    //     "public": true,
    //     "color": '#d49516',
    //     "favorited": true,
    //     "manager": [],
    //     "editor": ['2'],
    //     "viewer": ['5']
    // },
    // {

    //     "id": "8",
    //     "title": "사우디아라비아 시연용",
    //     "tags": ["covid-19"],
    //     "responsibilty": "3",
    //     "dateCreated": new Date(),
    //     "cohorts": 9,
    //     "public": true,
    //     "color": '#16b4d4',
    //     "favorited": true,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
    // {

    //     "id": "9",
    //     "title": "Ray 녹내장분석",
    //     "tags": [],
    //     "responsibilty": "2",
    //     "dateCreated": new Date(),
    //     "cohorts": 1,
    //     "public": true,
    //     "color": '#9516d4',
    //     "favorited": false,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
    // {

    //     "id": "10",
    //     "title": "MNGHA",
    //     "tags": ["covid-19", "test-02"],
    //     "responsibilty": "1",
    //     "dateCreated": new Date(),
    //     "cohorts": 10,
    //     "public": true,
    //     "color": '#d49516',
    //     "favorited": true,
    //     "manager": [],
    //     "editor": ['2'],
    //     "viewer": ['5']
    // },
    // {

    //     "id": "11",
    //     "title": "사우디아라비아 시연용",
    //     "tags": ["covid-19"],
    //     "responsibilty": "3",
    //     "dateCreated": new Date(),
    //     "cohorts": 9,
    //     "public": true,
    //     "color": '#16b4d4',
    //     "favorited": true,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
    // {

    //     "id": "12",
    //     "title": "Ray 녹내장분석",
    //     "tags": [],
    //     "responsibilty": "2",
    //     "dateCreated": new Date(),
    //     "cohorts": 1,
    //     "public": true,
    //     "color": '#9516d4',
    //     "favorited": false,
    //     "manager": ["6", "7", "8", "9", "10"]
    // },
]

export const projectColumns = [
    {
        "field": "id",
        "headerName": "",
        "disableReorder": true,
        "disableColumnMenu": true,
        "sortable": false,
        "type": "singleSelect",
        "width": 64,
        "renderCell": (params: any) => {
            const color = params.row.color
            return (
                <Box sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: `1px solid ${grey[300]}`,
                    backgroundColor: alpha(color, 0.1),
                    transition: 'all 0.35s ease',
                }}>
                    <Icon name='atom-simple'
                        size={24}
                        color={color}
                    />
                </Box>
            )
        },
    },
    {
        "field": "title",
        "headerName": "제목",
        // "disableReorder": true,
        "disableColumnMenu": true,
        "flex": 1
    },
    {
        "field": "tags",
        "headerName": "태그",
        "disableReorder": true,
        "disableColumnMenu": true,
        "sortable": false,
        "width": 172,
        "type": "singleSelect",
        "valueOptions": [...new Set(projectRows.map((o) => o.tags).flat())],
        "renderCell": (params: any) => {
            return (
                <Stack direction="row" spacing={1}>
                    {params.row.tags.map((item: string, index: number) => (
                        <Box
                            key={index}
                            sx={{
                                backgroundColor: grey[200],
                                p: theme.spacing(0, 1),
                                borderRadius: 0.5,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                            <Typography sx={{
                                fontSize: 12,
                                lineHeight: '16px',
                                fontWeight: '700',
                                color: grey[700]
                            }}>
                                # {item}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )
        },
    },
    {
        "field": "responsibilty",
        "headerName": "책임자",
        "disableReorder": true,
        "disableColumnMenu": true,
        "sortable": false,
        "width": 144,
        "type": "singleSelect",
        "renderCell": (params: any) => {
            const user = users[_.findIndex(users, el => el.id === params.row.responsibilty)]
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Box sx={{
                        minWidth: 24,
                        height: 24,
                        borderRadius: '24px',
                        backgroundColor: user?.color,
                        mr: 1,
                        transition: 'all 0.35s ease',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Typography sx={{
                            fontSize: 12,
                            lineHeight: '16px',
                            fontWeight: '700',
                            color: '#ffffff',
                            transition: 'all 0.35s ease'
                        }}>
                            {user?.shortcut}
                        </Typography>
                    </Box>
                    <Typography sx={{
                        fontSize: 14,
                        lineHeight: '20px',
                        fontWeight: '400',
                    }}>
                        {user?.name}
                    </Typography>
                </Box>
            )
        },
    },
    {
        "field": "dateCreated",
        "headerName": "생성일",
        // "disableReorder": true,
        "disableColumnMenu": true,
        "type": "date",
        "width": 116
    },
    {
        "field": "cohorts",
        "headerName": "연구코호트 갯수",
        "disableReorder": true,
        "disableColumnMenu": true,
        "sortable": false,
        "width": 116,
        "renderCell": (params: any) => {
            return <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{`${params.row.cohorts}개`}</Typography>
        },
    },
    {
        "field": "public",
        "headerName": "공개여부",
        // "disableReorder": true,
        "disableColumnMenu": true,
        "width": 116,
        "type": "singleSelect",
        "renderCell": (params: any) => {
            return (
                <Box
                    sx={{
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: params.row.public ? grey[200] : red[50],
                        p: theme.spacing(0, 1, 0, 0.5),
                        borderRadius: 0.5,
                    }}>
                    <Icon name='globe' color={params.row.public ? grey[700] : red[500]} size={16} sx={{ mr: 0.5 }} />
                    <Typography sx={{
                        fontSize: 12,
                        lineHeight: '16px',
                        fontWeight: '700',
                        color: params.row.public ? grey[700] : red[500]
                    }}>
                        {params.row.public ? '공개중' : '비공개'}
                    </Typography>
                </Box>
            )
        },
    },
]