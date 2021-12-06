const ratingHeaderController = async (req, res, db) => {
    if (req.method === 'GET') {
        // TODO: find a better way to do this
        const where = {};

        Object.keys(req.query).map((key) => {
            if (key.slice(0, 2) === 'is') { 
                // all isXxx queries are for booleans
                where[key] = req.query[key].toLowerCase() === 'true';
            } else {
                where[key] = req.query[key];
            }
        });

        const headers = await db.RatingHeader.findAll({ attributes: ['header', 'isTest'], raw: true, where: where });

        for (let i = 0; i < headers.length; i++) {
            headers[i].isTest = headers[i].isTest ? true : false; // SQL boolean is an integer
        }

        res.status(200).json(headers);
    } else if (req.method === 'PUT') {
        if (!req.body.header) {
            res.status(400).send('Operation requires value for header');
            return;
        }

        // model enforces uniqueness constraints
        try {
            const newRatingHeader = await db.RatingHeader.create({ header: req.body.header.trim() });
            const { header, isTest } = newRatingHeader.dataValues;
            res.status(200).json({ header, isTest });
        }
        catch (err) {
            res.status(409).send(err.original.sqlMessage);
        }
    } else if (req.method === 'POST') {
        let { currentHeader, header, isTest } = req.body;

        if (!currentHeader || !header || (isTest === undefined)) {
            res.status(400).send('Operation requires values for currentHeader, header, and isTest');
            return;
        }

        currentHeader = currentHeader.trim();
        header = header.trim();

        // model enforces uniqueness constraints
        try {
            const result = await db.RatingHeader.update({ header, isTest }, { where: { header: currentHeader }});

            if (result[0] !== 1) {
                throw new Error(`No header named ${currentHeader} exists.`);
            }

            res.status(200).json({ header, isTest })
        } catch (err) {
            if (err.original && err.original.sqlMessage) {
                res.status(409).send(err.original.sqlMessage);
            } else {
                res.status(409).send(err.message);
            }
        }
    } else if (req.method === 'DELETE') {
        if (!req.body.header || !req.body.header.trim()) {
            res.status(400).send('Operation requires value for header');
            return;
        }

        try {
            const deleted = await db.RatingHeader.destroy({ where: { 'header': req.body.header.trim() }});
            res.status(200).json({ deleted });
        } catch (err) {
            res.status(409).send(err.original.sqlMessage);
        }
    } else {
        res.sendStatus(405);
    }
};

module.exports = ratingHeaderController;