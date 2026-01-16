/**
 * @Author: weipc 755197142@qq.com
 * @Date: 2025-03-07 00:08:15
 * @LastEditors: weipc 755197142@qq.com
 * @LastEditTime: 2025-03-07 00:10:31
 * @FilePath: src/utils/reg.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
/**
 * 用户名正则
 *  允许中文、英文字母、数字、下划线、连字符
 *  长度限制：4-16 个字符
 */
export const REG_USER_NAME = /^[\u4E00-\u9FA5\w-]{4,16}$/;

/**
 * 手机号正则
 *  支持中国大陆手机号码格式
 *  以 1 开头，第二位数字根据运营商号段规则匹配
 *  共 11 位数字
 */
export const REG_PHONE = /^1((3\d)|(4[014-9])|(5[0-35-9])|(6[2567])|(7[0-8])|(8\d)|(9[0-35-9]))\d{8}$/;

/**
 * 密码正则
 *  长度要求：6-18 个字符
 *  允许使用字母、数字、下划线
 */
export const REG_PWD = /^\w{6,18}$/;

/**
 * 邮箱正则
 *  允许标准的邮箱格式：xxx@yyy.zzz
 *  支持多级域名，如 xxx@sub.domain.com
 */
export const REG_EMAIL = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

/**
 * 六位数字验证码正则
 *  仅允许 6 位数字
 */
export const REG_CODE_SIX = /^\d{6}$/;

/**
 * 四位数字验证码正则
 *  仅允许 4 位数字
 */
export const REG_CODE_FOUR = /^\d{4}$/;

/**
 * URL 正则
 *  允许匹配 http、https、www 开头的 URL
 *  支持 IP 地址、域名、多级路径、查询参数和片段标识符
 */
export const REG_URL = /(((^https?:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-]*)?\??[-+=&;%@.\w]*(?:#\w*)?)?)$/;
