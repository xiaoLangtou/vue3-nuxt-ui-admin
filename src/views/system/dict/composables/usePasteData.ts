import globalToast from '@/services/core/toast';

/**
 * 粘贴数据解析 Composable
 *
 * 支持两种格式:
 * 1. Excel 格式 (Tab 分隔): 标签\t值\t排序\t备注
 * 2. JSON 格式: 数组或单个对象
 */

interface ParsedItem {
    dictLabel: string;
    dictValue: string;
    dictSort?: number;
    dictDesc?: string;
    remark?: string;
}

export const usePasteData = () => {
    const pasteText = ref('');
    const showPasteArea = ref(false);

    /**
     * 解析粘贴的数据
     * @param text 粘贴的文本
     * @param startSort 起始排序号
     * @returns 解析后的数据数组
     */
    const parseData = (text: string, startSort: number = 1): ParsedItem[] => {
        if (!text.trim()) {
            return [];
        }

        const parsedItems: ParsedItem[] = [];
        const trimmedText = text.trim();

        try {
            // 尝试解析 JSON
            if ((trimmedText.startsWith('[') && trimmedText.endsWith(']')) ||
                (trimmedText.startsWith('{') && trimmedText.endsWith('}'))) {
                let jsonData = JSON.parse(trimmedText);
                if (!Array.isArray(jsonData)) {
                    jsonData = [jsonData];
                }

                jsonData.forEach((item: any) => {
                    // 兼容多种字段名
                    const label = item.dictLabel || item.label || item.name || '';
                    const value = item.dictValue || item.value || '';
                    const sort = item.dictSort || item.sort || 0;
                    const dictDesc = item.dictDesc || item.desc || "";
                    const remark = item.dictRemark || item.remark || '';

                    if (label || value) {
                        parsedItems.push({
                            dictLabel: String(label),
                            dictValue: String(value),
                            dictSort: Number(sort) || (startSort + parsedItems.length),
                            dictDesc: String(dictDesc),
                        });
                    }
                });
            } else {
                // Excel 格式 (Tab 分隔)
                const rows = text.split('\n').filter((row: string) => row.trim());
                rows.forEach((row: string) => {
                    const columns = row.split('\t');
                    const [label, value, sort, dictDesc,remark] = columns;

                    if (label?.trim() || value?.trim()) {
                        parsedItems.push({
                            dictLabel: label?.trim() || '',
                            dictValue: value?.trim() || '',
                            dictSort: sort ? Number(sort) || (startSort + parsedItems.length) : (startSort + parsedItems.length),
                            dictDesc: dictDesc?.trim() || '',
                            remark: remark?.trim() || '',
                        });
                    }
                });
            }
        } catch (e) {
            // JSON 解析失败
            if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
                throw new Error('JSON 格式错误');
            }
        }

        return parsedItems;
    };

    /**
     * 处理粘贴操作
     * @param onSuccess 成功回调,接收解析后的数据
     * @param startSort 起始排序号
     */
    const handlePaste = (onSuccess: (items: ParsedItem[]) => void, startSort: number = 1) => {
        if (!pasteText.value.trim()) {
            globalToast.warn('请粘贴数据');
            return;
        }

        try {
            const parsedItems = parseData(pasteText.value, startSort);

            if (parsedItems.length > 0) {
                onSuccess(parsedItems);
                globalToast.success(`已导入 ${parsedItems.length} 行数据`);
                showPasteArea.value = false;
                pasteText.value = '';
            } else {
                globalToast.warn('未检测到有效数据,支持 JSON 数组或 Excel 复制格式');
            }
        } catch (error) {
            if (error instanceof Error) {
                globalToast.error(error.message);
            } else {
                globalToast.error('数据解析失败');
            }
        }
    };

    /**
     * 取消粘贴
     */
    const cancelPaste = () => {
        showPasteArea.value = false;
        pasteText.value = '';
    };

    return {
        pasteText,
        showPasteArea,
        handlePaste,
        cancelPaste,
        parseData,
    };
};
