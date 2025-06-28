import { EmailService } from '../../../shared/services/email.service';
import { generateOTP } from '../utils/generate-otp';

export class OTPService {
  static async sendEmail(email: string): Promise<string> {
    const otpCode = generateOTP();

    await EmailService.send({
      to: email,
      subject: 'Код для входа в аккаунт на timestock',
      text: `Код: ${otpCode}`,
      html: `<b>Код: ${otpCode}</b>`,
    });

    return otpCode;
  }
}
