export class EmailService {
  static send(props: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    return strapi.plugins["email"].services.email.send(props);
  }
}
