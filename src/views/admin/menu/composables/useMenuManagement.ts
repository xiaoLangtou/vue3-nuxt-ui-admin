import { MenuAction, MenuType, type MenuFormData, type MenuQueryParams, type MenuStatus, type MenuTreeNode } from '@/types/menu';
import { type MenuCreateParams, type MenuUpdateParams, menuApi } from '@/services/modules/menu';
import { computed, reactive, ref } from 'vue';

/**
 * 菜单管理组合函数
 */
export function useMenuManagement() {
    const toast = useToast();

    // 状态管理
    const loading = ref(false);
    const menuList = ref<MenuTreeNode[]>([]);
    const selectedMenus = ref<MenuTreeNode[]>([]);
    const expandedKeys = ref<Record<string, boolean>>({});

    // 弹窗状态
    const dialogVisible = ref(false);
    const dialogAction = ref<MenuAction>(MenuAction.CREATE);
    const dialogTitle = computed(() => {
        const titleMap = {
            [MenuAction.CREATE]: '新增菜单',
            [MenuAction.EDIT]: '编辑菜单',
            [MenuAction.VIEW]: '查看菜单'
        };
        return titleMap[dialogAction.value as keyof typeof titleMap];
    });

    // 表单数据
    const formData = reactive<MenuFormData>({
        name: '',
        icon: '',
        type: MenuType.MENU,
        path: '',
        component: '',
        permission: '',
        iframeUrl: '',
        isIframe: '0',
        isHide: '0',
        isKeepAlive: '1',
        sort: 0,
        parentId: '',
        status: 1 as MenuStatus,
        remark: '',
        buttons: []
    });

    // 查询参数
    const queryParams = reactive<MenuQueryParams>({
        name: '',
        type: undefined,
        status: undefined,
        visible: undefined
    });

    /**
     * 获取菜单列表
     */
    const fetchMenuList = async () => {
        loading.value = true;
        try {
            // 将 reactive 对象转换为普通对象，避免参数嵌套
            const params = {
                name: queryParams.name || undefined,
                type: queryParams.type || undefined,
                status: queryParams.status !== undefined ? queryParams.status : undefined,
                visible: queryParams.visible !== undefined ? queryParams.visible : undefined
            };
            // 过滤掉 undefined 的值
            const filteredParams = Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value !== undefined)
            );
            const response = await menuApi.getMenuTree(filteredParams);

            // 处理菜单数据，将按钮作为子节点添加到菜单树中
            const processMenuData = (items: any[]): MenuTreeNode[] => {
                if (!items) return [];
                return items.map((item) => {
                    const newItem = { ...item };
                    // 兼容处理 sortOrder
                    if (newItem.sortOrder !== undefined && newItem.sort === undefined) {
                        newItem.sort = newItem.sortOrder;
                    }

                    // 递归处理子菜单
                    let children = newItem.children ? processMenuData(newItem.children) : [];

                    // 将按钮转换为菜单节点
                    if (newItem.buttons && newItem.buttons.length > 0) {
                        const buttonNodes = newItem.buttons.map((btn: any) => ({
                            id: `btn-${btn.id}`,
                            name: btn.name,
                            permission: btn.permission,
                            type: MenuType.BUTTON,
                            menuType: MenuType.BUTTON,
                            parentId: newItem.id,
                            sort: 0,
                            status: 1,
                            visible: true,
                            path: '',
                            component: '',
                            icon: 'i-lucide-circle-dot',
                            children: []
                        }));
                        children = [...children, ...buttonNodes];
                    }

                    if (children.length > 0) {
                        newItem.children = children;
                    } else {
                        delete newItem.children;
                    }

                    return newItem;
                });
            };

            menuList.value = processMenuData(response || []);

            // 默认展开第一级
            expandedKeys.value = {};
            menuList.value.forEach((menu: MenuTreeNode) => {
                if (menu.children && menu.children.length > 0) {
                    expandedKeys.value[menu.id!] = true;
                }
            });
        } catch (error) {
            console.error('获取菜单列表失败:', error);
            // 如果API调用失败，使用空数据
            menuList.value = [];
            expandedKeys.value = {};

            toast.add({
                color: 'error',
                title: '错误',
                description: '获取菜单列表失败'
            });
        } finally {
            loading.value = false;
        }
    };

    /**
     * 搜索菜单
     */
    const searchMenus = async () => {
        await fetchMenuList();
    };

    /**
     * 重置表单
     */
    const resetForm = () => {
        Object.assign(formData, {
            id: undefined,
            name: '',
            icon: '',
            type: MenuType.MENU,
            path: '',
            component: '',
            permission: '',
            iframeUrl: '',
            isIframe: '0',
            isHide: '0',
            isKeepAlive: '1',
            sort: 0,
            parentId: '',
            status: 1 as MenuStatus,
            remark: '',
            buttons: []
        });
    };

    /**
     * 打开新增菜单弹窗
     */
    const openCreateDialog = (parentId?: string) => {
        resetForm();
        if (parentId) {
            formData.parentId = parentId;
        }
        dialogAction.value = MenuAction.CREATE;
        dialogVisible.value = true;
    };

    /**
     * 打开编辑菜单弹窗
     */
    const openEditDialog = (menu: MenuTreeNode) => {
        Object.assign(formData, {
            id: menu.id,
            name: menu.name,
            icon: menu.icon || '',
            type: menu.type,
            path: menu.path || '',
            component: menu.component || '',
            permission: menu.permission || '',
            iframeUrl: menu.iframeUrl || '',
            isIframe: menu.isIframe || '0',
            isHide: menu.isHide || '0',
            isKeepAlive: menu.isKeepAlive || '1',
            sort: menu.sort,
            parentId: menu.parentId || '',
            status: menu.status,
            remark: menu.remark || '',
            buttons: (menu as any).buttons || []
        });
        dialogAction.value = MenuAction.EDIT;
        dialogVisible.value = true;
    };

    /**
     * 保存菜单
     */
    const saveMenu = async () => {
        try {
            loading.value = true;

            // 准备API请求数据
            const menuData = {
                name: formData.name,
                icon: formData.icon,
                type: formData.type,
                path: formData.path,
                component: formData.component,
                permission: formData.permission,
                isLink: formData.isLink,
                iframeUrl: formData.iframeUrl,
                isIframe: formData.isIframe,
                isHide: formData.isHide,
                sort: formData.sort,
                parentId: formData.parentId,
                status: formData.status,
                remark: formData.remark,
                buttons: formData.buttons
            };

            if (dialogAction.value === MenuAction.CREATE) {
                // 创建菜单
                await menuApi.createMenu(menuData as MenuCreateParams);
                toast.add({
                    color: 'success',
                    title: '成功',
                    description: '菜单创建成功'
                });
            } else {
                // 更新菜单
                await menuApi.updateMenu({ ...menuData, id: formData.id } as MenuUpdateParams);
                toast.add({
                    color: 'success',
                    title: '成功',
                    description: '菜单更新成功'
                });
            }

            dialogVisible.value = false;
            await fetchMenuList();
        } catch (error) {
            console.error('保存菜单失败:', error);
            toast.add({
                color: 'error',
                title: '错误',
                description: '保存菜单失败，请检查网络连接或稍后重试'
            });
        } finally {
            loading.value = false;
        }
    };

    /**
     * 删除菜单
     */
    const deleteMenu = async (menu: MenuTreeNode) => {
        try {
            // 检查是否有子菜单
            if (menu.children && menu.children.length > 0) {
                toast.add({
                    color: 'orange',
                    title: '警告',
                    description: '该菜单下存在子菜单，请先删除子菜单'
                });
                return;
            }

            // 调用删除菜单API
            await menuApi.deleteMenu(menu.id);

            toast.add({
                color: 'success',
                title: '成功',
                description: '菜单删除成功'
            });

            await fetchMenuList();
        } catch (error) {
            console.error('删除菜单失败:', error);
            toast.add({
                color: 'error',
                title: '错误',
                description: '删除菜单失败'
            });
        }
    };

    /**
     * 批量删除菜单
     */
    const batchDeleteMenus = async () => {
        if (selectedMenus.value.length === 0) {
            toast.add({
                color: 'orange',
                title: '警告',
                description: '请选择要删除的菜单'
            });
            return;
        }

        try {
            // 获取选中菜单的ID数组
            const menuIds = selectedMenus.value.map((menu) => menu.id);

            // 调用批量删除菜单API
            await menuApi.batchDeleteMenus(menuIds);

            toast.add({
                color: 'success',
                title: '成功',
                description: `成功删除 ${selectedMenus.value.length} 个菜单`
            });

            selectedMenus.value = [];
            await fetchMenuList();
        } catch (error) {
            console.error('批量删除菜单失败:', error);
            toast.add({
                color: 'error',
                title: '错误',
                description: '批量删除菜单失败'
            });
        }
    };

    /**
     * 导出菜单
     */
    const exportMenus = () => {
        try {
            const exportData = {
                menus: menuList.value,
                exportTime: new Date().toISOString(),
                version: '1.0.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `menus_${new Date().getTime()}.json`;
            link.click();

            URL.revokeObjectURL(url);

            toast.add({
                color: 'success',
                title: '成功',
                description: '菜单导出成功'
            });
        } catch (error) {
            console.error('导出菜单失败:', error);
            toast.add({
                color: 'error',
                title: '错误',
                description: '导出菜单失败'
            });
        }
    };

    /**
     * 刷新菜单列表
     */
    const refreshMenus = () => {
        selectedMenus.value = [];
        fetchMenuList();
    };

    /**
     * 获取菜单树选项（用于父级菜单选择）
     */
    const getMenuTreeOptions = (excludeId?: string): MenuTreeNode[] => {
        // 优先使用本地数据进行过滤，避免重复API调用
        const filterMenu = (menus: MenuTreeNode[]): MenuTreeNode[] => {
            return menus
                .filter((menu) => menu.id !== excludeId && menu.type !== 'button')
                .map((menu) => ({
                    ...menu,
                    children: menu.children ? filterMenu(menu.children) : undefined
                }));
        };

        return filterMenu(menuList.value);
    };

    /**
     * 获取父级菜单选项（API版本）
     */
    const fetchParentMenuOptions = async (excludeId?: string): Promise<MenuTreeNode[]> => {
        try {
            const response = await menuApi.getParentMenuOptions(excludeId);
            return response || [];
        } catch (error) {
            console.error('获取父级菜单选项失败:', error);
            // 如果API调用失败，使用本地数据
            return getMenuTreeOptions(excludeId);
        }
    };

    return {
        // 状态
        loading,
        menuList,
        selectedMenus,
        expandedKeys,

        // 弹窗状态
        dialogVisible,
        dialogAction,
        dialogTitle,

        // 表单数据
        formData,
        queryParams,

        // 方法
        fetchMenuList,
        searchMenus,
        openCreateDialog,
        openEditDialog,
        saveMenu,
        deleteMenu,
        batchDeleteMenus,
        exportMenus,
        refreshMenus,
        getMenuTreeOptions,
        fetchParentMenuOptions,
        resetForm,
        toast
    };
}
