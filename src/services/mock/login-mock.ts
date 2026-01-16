import type { ICaptcha, ILoginAccount, ILoginResponse } from '../types/login';

/**
 * 登录 Mock 服务
 * 用于在没有后端的情况下测试登录功能
 */
export class LoginMockService {
  private static captchaCode = '';
  private static captchaId = '';

  /**
   * 生成随机验证码
   */
  private static generateCaptchaCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 生成验证码 SVG
   */
  private static generateCaptchaSvg(code: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
      <rect width="120" height="40" fill="#f0f0f0"/>
      <text x="10" y="28" font-size="24" font-weight="bold" fill="#333">${code}</text>
      <line x1="0" y1="20" x2="120" y2="20" stroke="#ccc" stroke-width="1"/>
    </svg>`;
  }

  /**
   * 获取验证码
   */
  static getCaptchaImage(): Promise<ICaptcha> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.captchaCode = this.generateCaptchaCode();
        this.captchaId = `captcha_${Date.now()}`;

        console.log('🔐 Mock 验证码:', this.captchaCode);

        resolve({
          captchaId: this.captchaId,
          captcha: this.generateCaptchaSvg(this.captchaCode),
        });
      }, 300);
    });
  }

  /**
   * 登录
   */
  static login(account: ILoginAccount): Promise<ILoginResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 验证验证码
        if (account.captcha.toUpperCase() !== this.captchaCode) {
          reject(new Error('验证码错误'));
          return;
        }

        // 验证账号密码 (MD5加密后的密码)
        // admin/12345678 的 MD5: 25d55ad283aa400af464c76d713c07ad
        const validUsers = [
          { username: 'admin', password: '25d55ad283aa400af464c76d713c07ad' },
          { username: 'user', password: '25d55ad283aa400af464c76d713c07ad' },
        ];

        const user = validUsers.find(
          u => u.username === account.username && u.password === account.password,
        );

        if (!user) {
          reject(new Error('账号或密码错误'));
          return;
        }

        // 登录成功
        resolve({
          accessToken: `mock_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          userInfo: {
            id: 1,
            username: account.username,
            nickname: account.username === 'admin' ? '管理员' : '普通用户',
            roles: account.username === 'admin' ? ['admin'] : ['user'],
            permissions: account.username === 'admin' ? ['*:*:*'] : ['read'],
            headPic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.username}`,
            email: `${account.username}@example.com`,
          },
        });
      }, 500);
    });
  }

  /**
   * 获取用户信息
   */
  static getUserInfo(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 1,
          username: 'admin',
          nickname: '管理员',
          roles: ['admin'],
          permissions: ['*:*:*'],
          headPic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          email: 'admin@example.com',
        });
      }, 300);
    });
  }

  /**
   * 退出登录
   */
  static logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }
}
