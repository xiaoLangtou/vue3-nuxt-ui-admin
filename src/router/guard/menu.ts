import { type RouteLocationNormalized, type Router, type RouteRecordRaw, RouterView } from 'vue-router';
// @ts-ignore
import nProgress from 'nprogress';
import useMenuStore from '@/stores/menu';


export interface MetaProps {
    icon: string;
    title: string;
    activeMenu?: string;
    isLink?: string;
    isHide: boolean;
    isFull: boolean;
    isAffix: boolean;
    isKeepAlive: boolean;
}

export interface MenuOptions {
    id: number;
    path: string;
    name: string;
    component: string;
    redirect?: string;
    meta: MetaProps;
    menuType?: string;
    children?: MenuOptions[];
    parentId?: string;

    [key: string]: any;
}

const views = (import.meta as any).glob('../../views/**/*.vue');

function toRoutes(menus: MenuOptions[]) {
    const routes: RouteRecordRaw[] = [];
    console.log(menus);
    menus.forEach((menu) => {

        const componentPath = menu.component;
        const hasChildren = menu.children && menu.children.length > 0;
        console.log(componentPath);
        let component: any;
        let path = '';

        if (hasChildren && !componentPath) {
            component = RouterView;
        } else if (componentPath) {

            if (componentPath.startsWith('http://') || componentPath.startsWith('https://')) {
                return;
            }

            const normalizedPath = componentPath.startsWith('/') ? componentPath : `/${componentPath}`;
            path = `../../views${normalizedPath}${normalizedPath.includes('.vue') ? '' : '.vue'}`;

            if (views[path]) {
                component = views[path];
            } else {
                component = () => import('@/views/error-page/not-found.vue');
            }
        } else {
            return;
        }



        const route: any = {
            name: menu.name,
            path: menu.path,
            component,
            meta: {
                ...menu.meta,
                id: menu.id,
                parentId: menu.parentId,
            },
        };

        console.log(route);

        if (hasChildren) {
            route.children = toRoutes(menu.children!);
        }

        if (menu.redirect) {
            route.redirect = menu.redirect;
        }

        routes.push(route as RouteRecordRaw);
    });

    return routes;
}

function setWebsiteTitle(router: Router, to: RouteLocationNormalized) {
    const route = router.getRoutes().find((item: RouteRecordRaw) => item.path === to.path);
    const appTitle = (import.meta as any).env?.VITE_GLOB_APP_TITLE || 'Admin';
    useTitle(route?.meta?.title ? `${route?.meta?.title} - ${appTitle}` : appTitle);
}

export default function setupMenuGuard(router: Router) {
    let isMenuLoaded = false; // 改名，更清晰

    router.beforeEach(async (to, from, next) => {
        nProgress.start();

        // 登录页直接放行
        if (to.name === 'Login') {
            next();
            nProgress.done();
            return;
        }

        const { menuList, getAuthMenuList } = useMenuStore();

        // 如果菜单已加载，直接放行
        if (isMenuLoaded && menuList.length) {
            setWebsiteTitle(router, to);
            next();
            nProgress.done();
            return;
        }

        // 首次加载菜单
        try {
            const data = await getAuthMenuList();


            if (!data.length) {
                next({ name: '403' });
                nProgress.done();
                return;
            }

            // 添加动态路由
            const routes = toRoutes(data);
            routes.forEach((route: RouteRecordRaw) => {
                if (route.name && !router.hasRoute(route.name as string)) {

                    router.addRoute('root', route);
                }
            });

            if (!router.hasRoute('NotFound')) {
                router.addRoute({
                    path: '/:pathMatch(.*)*',
                    name: 'NotFound',
                    component: () => import('@/views/error-page/not-found.vue'),
                });
            }

            isMenuLoaded = true;

            setWebsiteTitle(router, to);

            // 重新导航到目标路由
            next({ ...to, replace: true });

        } catch (error) {
            next({ name: 'Login' });
        } finally {
            nProgress.done();
        }
    });
}
