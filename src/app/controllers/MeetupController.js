import * as Yup from 'yup';
import { parseISO, isBefore, subDays } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { page } = req.query;

    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        },
        {
          model: File,
          as: 'image',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

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

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      image_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { meetupId } = req.params;

    const meetup = await Meetup.findOne({
      where: { id: meetupId, user_id: req.userId },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'Invalid meetup' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: 'This meetup has ben passed' });
    }

    const { title, location, date } = await meetup.update(req.body);

    return res.json({ title, location, date });
  }

  async delete(req, res) {
    const { meetupId } = req.params;

    const meetup = await Meetup.findOne({
      where: { id: meetupId, user_id: req.userId },
    });

    if (meetup.past) {
      return res.status(401).json({ error: 'This meetup has ben passed' });
    }

    meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
