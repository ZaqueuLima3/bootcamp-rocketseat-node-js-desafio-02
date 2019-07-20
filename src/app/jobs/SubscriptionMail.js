import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Novo usuario inscrito',
      template: 'subscription',
      context: {
        meetup: meetup.title,
        user: meetup.user.name,
        date: format(
          parseISO(meetup.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
