import * as Yup from 'yup';
import { parseISO, isBefore, subDays } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      image_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { title, description, location, date, image_id } = req.body;

    /**
     * check past dates
     */
    const dateStart = parseISO(date);

    const haveAnotherMeetup = await Meetup.findOne({
      where: { user_id: req.userId, date: dateStart },
    });

    if (haveAnotherMeetup) {
      return res
        .status(401)
        .json({ error: "You can't create two meetups in the same date!" });
    }

    if (!isBefore(new Date(), subDays(dateStart, 2))) {
      return res.status(400).json({
        error: 'you can only create meetups 2 days before the initial date',
      });
    }

    const meetups = await Meetup.create({
      title,
      description,
      location,
      date,
      image_id,
      user_id: req.userId,
    });

    return res.json(meetups);
  }
}

export default new MeetupController();
