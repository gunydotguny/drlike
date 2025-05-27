import { IconName } from "@fortawesome/fontawesome-svg-core"

export type TabProps = {
    icon : IconName,
    title: string,
    value: string,
}

export const navigationTabs : TabProps[] = [
    {
        icon: 'user',
        title: '내 연구',
        value: 'myspace'
    },
    {
        icon: 'atom-simple',
        title: '프로젝트',
        value: 'project'
    }
]


export type NavigationProps = {
    icon: IconName,
    url: string,
    title: string,
    type: 'common' | 'uncommon',
    step?: number
}


export const navigations: NavigationProps[] = [
    {
        icon: 'bars',
        url: '/invited',
        title: '모든 프로젝트',
        type: 'uncommon',
        step: 0,
    },
    {
        icon: 'users',
        url: '/generate',
        title: '연구코호트',
        type: 'uncommon',
        step: 1,
    },
    {
        icon: 'layer-plus',
        url: '/data_table',
        title: '항목 추가 / 업로드',
        type: 'uncommon',
        step: 1,
    },
    {
        icon: 'database',
        url: '/feature_table',
        title: '데이터셋 구성',
        type: 'uncommon',
        step: 2,
    },
    {
        icon: 'square-poll-vertical',
        url: '/statistical_analysis',
        title: '통계분석',
        type: 'uncommon',
        step: 2,
    },
    {
        icon: 'microchip-ai',
        url: '/machine_learning',
        title: '기계학습',
        type: 'uncommon',
        step: 2,
    },
    {
        icon: 'radar',
        url: '/code_discover',
        title: '코드 통합 탐색',
        type: 'common',
    },
    {
        icon: 'chart-network',
        url: '/code_set',
        title: '코드 Set',
        type: 'common',
    },
]