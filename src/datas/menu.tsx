
export type MenuProps = {
    auth?: `user` | `refiner` | `refinement_manager`
    admin: boolean,
    label: string,
    url: string
}

export const menuList = [
    {
        auth: `user`,
        admin: false,
        label: `내 문의사항`,
        url: `/user/questions`
    },
    {
        auth: `user`,
        admin: false,
        label: `대시보드`,
        url: `/user/dashboard`
    },
    {
        auth: `refiner`,
        admin: false,
        label: `데이터 정제`,
        url: `/refiner/refinement`
    },
    {
        auth: `refinement_manager`,
        admin: false,
        label: `정제 할당`,
        url: `/refinement_manager/refinement_assignment`
    },
    {
        auth: `refinement_manager`,
        admin: false,
        label: `정제 검토`,
        url: `/refinement_manager/refinement_management`
    },
    {
        auth: `refinement_manager`,
        admin: false,
        label: `발제 논의`,
        url: `/refinement_manager/discussion`
    },
    {
        admin: true,
        label: `사용자 관리`,
        url: `/admin/user_management`
    },
    {
        admin: true,
        label: `이용로그 관리`,
        url: `/admin/log_management`
    },
    {
        admin: true,
        label: `대표표준 관리`,
        url: `/admin/standard_management`
    },
    {
        admin: true,
        label: `데이터 관리`,
        url: `/admin/data_management`
    },
]