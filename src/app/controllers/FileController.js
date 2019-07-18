import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    try {
      const file = await File.create({
        name,
        path,
      });

      return res.json(file);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }
}

export default new FileController();
