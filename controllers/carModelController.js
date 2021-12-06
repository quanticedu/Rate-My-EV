const carModelController = async (req, res, db) => {
    if (req.method === 'GET') {
        let carModels = await db.CarModel.findAll({ attributes: ['name', 'isTest'], raw: true });
        res.status(200).json(carModels);
    } else if (req.method === 'PUT') {
        if (!req.body.name) {
            res.status(400).send('Operation requires value for name');
            return;
        }

        const carModelData = { name: req.body.name.trim() };

        if (req.body.isTest) {
            carModelData.isTest = req.body.isTest;
        }

        // model enforces uniqueness constraints
        try {
            const newCarModel = await db.CarModel.create(carModelData);
            let {name, isTest} = newCarModel.dataValues;
            res.status(200).json({ name, isTest });
        }
        catch (err) {
            res.status(409).send(err.original.sqlMessage);
        }
    } else {
        res.sendStatus(405);
    }
};

module.exports = carModelController;