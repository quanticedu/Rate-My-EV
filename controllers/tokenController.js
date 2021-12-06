const { Op } = require('sequelize');

const tokenController = async (req, res, db) => {
    if (req.method === 'GET') {
        // TODO: find a better way to do this
        const where = {};
        Object.keys(req.query).map((key) => {
            if (key === 'isUsed') {
                where.dateUsed = (req.query[key].toLowerCase() === 'true') ? {[Op.not]: null} : {[Op.is]: null};
            } else if (key.slice(0, 2) === 'is') { 
                // all isXxx queries are for booleans
                where[key] = req.query[key].toLowerCase() === 'true';
            } else {
                where[key] = req.query[key];
            }
        });

        const tokens = await db.Token.findAll({
            attributes: ['value', 'isTest', 'dateIssued', 'dateUsed'],
            where: where,
            include: db.CarModel,
            raw: true,
        });

        const result = tokens.map((token) => (Object.assign(token, { carModelName: token['CarModel.name'] })));
        res.status(200).json(result);
    } else if (req.method === 'PUT') {
        if (!req.body.carModelName) {
            res.status(400).send('Operation requires value for carModelName')
            return;
        }

        const carModel = await db.CarModel.findOne({
            where: { name: req.body.carModelName },
            raw: true,
        });

        if (!carModel) {
            res.status(409).send(`${req.body.carModelName} is not in the database`);
            return;
        }

        const tokenData = { CarModelId: carModel.id };

        if (req.body.isTest) {
            tokenData.isTest = req.body.isTest
        };

        const newToken = await db.Token.create(tokenData);

        res.status(200).json({ tokenValue: newToken.value });
    } else {
        res.sendStatus(405);
    }
};

module.exports = tokenController;