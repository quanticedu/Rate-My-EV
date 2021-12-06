const ratingController = async (req, res, db) => {
    if (req.method === 'PUT') {
        // these will hold the ids of associated records as they're found
        const tokenIds = { };
        const ratingHeaderIds = { };

        try {
            for (let i = 0; i < req.body.length; i++) {
                // TODO: I'm sure there's a neater way to do this using Sequelize association features.
                if (!tokenIds[req.body[i].token]) {
                    const token = await db.Token.findOne({
                        attributes: ['id'],
                        where: { value: req.body[i].token },
                        // don't use raw: true here, because we need the instance to save that the token is used
                    });

                    if (!token) {
                        res.status(409).send(`Token ${req.body[i].token} is not in the database`);
                        return;
                    }

                    tokenIds[req.body[i].token] = token.dataValues.id;
                    token.dateUsed = Date.now();
                    await token.save();
                }

                if (!ratingHeaderIds[req.body[i].ratingHeader]) {
                    const ratingHeader = await db.RatingHeader.findOne({
                        attributes: ['id'],
                        where: { header: req.body[i].ratingHeader },
                        raw: true,
                    });

                    if (!ratingHeader) {
                        res.status(409).send(`Rating header ${req.body[i].ratingHeader} is not in the database`);
                        return;
                    }

                    ratingHeaderIds[req.body[i].ratingHeader] = ratingHeader.id;
                }

                await db.Rating.create({
                    rating: req.body[i].rating,
                    isTest: req.body[i].isTest ? 1 : 0,
                    TokenId: tokenIds[req.body[i].token],
                    RatingHeaderId: ratingHeaderIds[req.body[i].ratingHeader],
                });
            }

            res.status(200).json({ created: req.body.length.length });
        } catch (err) {
            if (err.original && err.original.sqlMessage) {
                res.status(409).send(err.original.sqlMessage);
            } else {
                res.status(409).send(err.message);
            }
        }
    } else if (req.method === 'GET') {
        const where = { };

        if (req.query.isTest) {
            where.isTest = req.query.isTest.toLowerCase() === 'true';
        }

        const ratings = await db.Rating.findAll({
            where: where,
            include: [{ all: true, nested: true }],
            raw: true,
        });

        let result = [];

        // TODO: I'm sure there's some cool functional programming way to do this.
        if (req.query.tallyResults && (req.query.tallyResults.toLowerCase() === 'true')) {
            let r = { };

            ratings.forEach((rating) => {
                if (r[rating['Token.CarModel.name']]) {
                    if (r[rating['Token.CarModel.name']][rating['RatingHeader.header']]) {
                        r[rating['Token.CarModel.name']][rating['RatingHeader.header']].push(rating.rating);
                    } else {
                        r[rating['Token.CarModel.name']][rating['RatingHeader.header']] = [rating.rating];
                    }
                } else {
                    r[rating['Token.CarModel.name']] = { };
                    r[rating['Token.CarModel.name']][rating['RatingHeader.header']] = [rating.rating];
                }
            });

            Object.keys(r).forEach((carModel) => {
                Object.keys(r[carModel]).forEach((ratingHeader) => {
                    result.push({
                        rating: r[carModel][ratingHeader].reduce((r1, r2) => (r1 + r2)) / r[carModel][ratingHeader].length,
                        ratingHeader: ratingHeader,
                        carModel: carModel,
                    });
                });
            });
        } else {
            result = ratings.map((rating) => ({
                rating: rating.rating,
                ratingHeader: rating.ratingHeader,
                carModel: rating.token.carModel.type,
            }));
        }

        res.status(200).json(result);
    } else {
        res.sendStatus(405);
    }
};

module.exports = ratingController;
